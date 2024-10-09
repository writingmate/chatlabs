import { Database, Tables } from "@/supabase/types"
import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { LLMID } from "@/types"
import { SupabaseClient } from "@supabase/supabase-js"
import { SubscriptionRequiredError } from "@/lib/errors"
import {
  CATCHALL_MESSAGE_DAILY_LIMIT,
  FREE_MESSAGE_DAILY_LIMIT,
  PRO_MESSAGE_DAILY_LIMIT,
  PRO_ULTIMATE_MESSAGE_DAILY_LIMIT,
  ULTIMATE_MESSAGE_DAILY_LIMIT,
  validatePlanForModel
} from "@/lib/subscription"
import {
  PLAN_FREE,
  PLAN_PREMIUM,
  PLAN_PRO,
  PLAN_ULTIMATE
} from "@/lib/stripe/config"
import { ApiError } from "next/dist/server/api-utils"

function createClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        }
      }
    }
  )
}

export async function getServerProfile() {
  const cookieStore = cookies()
  const supabase = createClient()

  const user = (await supabase.auth.getUser()).data.user
  if (!user) {
    throw new ApiError(401, "User not found")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!profile) {
    throw new ApiError(401, "Profile not found")
  }

  const profileWithKeys = addApiKeysToProfile(profile)

  return profileWithKeys
}

function addApiKeysToProfile(profile: Tables<"profiles">) {
  const apiKeys = {
    [VALID_ENV_KEYS.OPENAI_API_KEY]: "openai_api_key",
    [VALID_ENV_KEYS.ANTHROPIC_API_KEY]: "anthropic_api_key",
    [VALID_ENV_KEYS.GOOGLE_GEMINI_API_KEY]: "google_gemini_api_key",
    [VALID_ENV_KEYS.MISTRAL_API_KEY]: "mistral_api_key",
    [VALID_ENV_KEYS.GROQ_API_KEY]: "groq_api_key",
    [VALID_ENV_KEYS.PERPLEXITY_API_KEY]: "perplexity_api_key",
    [VALID_ENV_KEYS.AZURE_OPENAI_API_KEY]: "azure_openai_api_key",
    [VALID_ENV_KEYS.OPENROUTER_API_KEY]: "openrouter_api_key",
    [VALID_ENV_KEYS.JINA_API_KEY]: "jina_api_key",

    [VALID_ENV_KEYS.OPENAI_ORGANIZATION_ID]: "openai_organization_id",

    [VALID_ENV_KEYS.AZURE_OPENAI_ENDPOINT]: "azure_openai_endpoint",
    [VALID_ENV_KEYS.AZURE_GPT_35_TURBO_NAME]: "azure_openai_35_turbo_id",
    [VALID_ENV_KEYS.AZURE_GPT_45_VISION_NAME]: "azure_openai_45vision_id",
    [VALID_ENV_KEYS.AZURE_GPT_45_TURBO_NAME]: "azure_openai_45_turbo_id",
    [VALID_ENV_KEYS.AZURE_EMBEDDINGS_NAME]: "azure_openai_embeddings_id"
  }

  if (!profile.plan.startsWith("byok_")) {
    for (const [envKey, profileKey] of Object.entries(apiKeys)) {
      if (process.env[envKey] && !(profile as any)[profileKey]) {
        ;(profile as any)[profileKey] = process.env[envKey]
      }
    }
  }

  return profile
}

export function checkApiKey(
  apiKey: string | null | undefined,
  keyName: string
) {
  if (!!!apiKey) {
    throw new Error(`${keyName} API Key not found`)
  }
}

const TIER_MODELS = {
  [PLAN_ULTIMATE]: LLM_LIST.filter(x => x.tier === PLAN_ULTIMATE).map(
    x => x.modelId
  ),
  [PLAN_PRO]: LLM_LIST.filter(x => x.tier === PLAN_PRO).map(x => x.modelId),
  [PLAN_FREE]: LLM_LIST.filter(
    x => x.tier === PLAN_FREE || typeof x.tier === "undefined"
  ).map(x => x.modelId)
}

function isTierModel(model: LLMID, tier: keyof typeof TIER_MODELS) {
  if (tier == PLAN_FREE && TIER_MODELS[tier]) {
    return TIER_MODELS[PLAN_FREE].includes(model)
  }

  if (tier == PLAN_PRO && TIER_MODELS[tier]) {
    return TIER_MODELS[PLAN_PRO].includes(model)
  }

  if (tier == PLAN_ULTIMATE) {
    return TIER_MODELS[PLAN_ULTIMATE].includes(model)
  }

  return false
}

export async function validateModel(profile: Tables<"profiles">, model: LLMID) {
  if (!validatePlanForModel(profile, model)) {
    const modelData = LLM_LIST.find(
      x => x.modelId === model || x.hostedId === model
    )
    const requiredPlan = modelData?.tier === "ultimate" ? "Ultimate" : "Pro"
    throw new SubscriptionRequiredError(
      `${requiredPlan} plan required to use this model`
    )
  }
}

export async function validateMessageCount(
  profile: Tables<"profiles">,
  model: LLMID,
  date: Date,
  supabase: SupabaseClient
) {
  const userPlan = profile.plan.split("_")[0]

  if (userPlan.startsWith("byok")) {
    return
  }

  // Check if free or premium user is trying to use a non-free model
  if (
    (userPlan === PLAN_FREE || userPlan === PLAN_PREMIUM) &&
    !isTierModel(model, PLAN_FREE)
  ) {
    throw new SubscriptionRequiredError(
      `${isTierModel(model, PLAN_PRO) ? "Pro" : "Ultimate"} plan required to use this model`
    )
  }

  // clone date and set it to midnight
  let previousDate = new Date(date)
  previousDate.setUTCHours(0, 0, 0, 0)

  // count messages sent today starting from midnight
  const { count } = await supabase
    .from("messages")
    .select("*", {
      count: "exact"
    })
    .eq("role", "user")
    .eq("model", model)
    .gte("created_at", previousDate.toISOString())

  if (count === null) {
    throw new Error("Could not fetch message count")
  }

  // Check catch-all limit first
  if (count >= CATCHALL_MESSAGE_DAILY_LIMIT) {
    throw new SubscriptionRequiredError(
      `You have reached hard daily message limit for model ${model}`
    )
  }

  if (
    (userPlan === PLAN_FREE || userPlan.startsWith("premium")) &&
    count >= FREE_MESSAGE_DAILY_LIMIT
  ) {
    throw new SubscriptionRequiredError(
      `You have reached daily message limit for ${model}. Upgrade to Pro/Ultimate plan to continue or come back tomorrow.`
    )
  }

  if (
    isTierModel(model, PLAN_PRO) &&
    userPlan === PLAN_PRO &&
    count >= PRO_MESSAGE_DAILY_LIMIT
  ) {
    throw new SubscriptionRequiredError(
      `You have reached daily message limit for Pro plan for ${model}`
    )
  }

  const ULTIMATE_GRANDFATHERED_DATE =
    process.env.ULTIMATE_GRANDFATHERED_DATE || "2024-09-16"

  // grandfathered pro users created before 2024-09-16 and using opus models
  const isGrandfathered =
    profile.created_at < ULTIMATE_GRANDFATHERED_DATE &&
    userPlan === PLAN_PRO &&
    model.includes("opus")

  if (
    isTierModel(model, PLAN_ULTIMATE) &&
    userPlan === PLAN_PRO &&
    !isGrandfathered
  ) {
    if (count >= PRO_ULTIMATE_MESSAGE_DAILY_LIMIT) {
      throw new SubscriptionRequiredError(
        `You have reached daily message limit for Pro plan for ${model}. Upgrade to Ultimate plan to continue or come back tomorrow.`
      )
    }
  } else if (
    isTierModel(model, PLAN_ULTIMATE) &&
    userPlan === PLAN_PRO &&
    isGrandfathered
  ) {
    if (count >= ULTIMATE_MESSAGE_DAILY_LIMIT) {
      throw new SubscriptionRequiredError(
        `You have reached daily message limit for Ultimate plan for ${model}`
      )
    }
  }

  if (
    isTierModel(model, PLAN_ULTIMATE) &&
    userPlan === PLAN_ULTIMATE &&
    count >= ULTIMATE_MESSAGE_DAILY_LIMIT
  ) {
    throw new SubscriptionRequiredError(
      `You have reached daily message limit for Ultimate plan for ${model}`
    )
  }
}

export async function validateModelAndMessageCount(model: LLMID, date: Date) {
  const client = createClient()
  const profile = await getServerProfile()
  await validateModel(profile, model)
  await validateMessageCount(profile, model, date, client)
}
