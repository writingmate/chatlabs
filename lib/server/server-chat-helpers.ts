import { Database, Tables } from "@/supabase/types"
import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { LLMID } from "@/types"
import { SupabaseClient } from "@supabase/supabase-js"
import { SubscriptionRequiredError } from "@/lib/errors"
import {
  FREE_CATCHALL_DAILY_LIMIT,
  FREE_TIER2_LIMIT,
  FREE_TIER3_DAILY_LIMIT,
  getModelTier,
  ModelTier,
  PRO_TIER1_DAILY_LIMIT,
  PRO_TIER2_DAILY_LIMIT,
  validateProPlan
} from "@/lib/subscription"
import { PLAN_FREE } from "@/lib/stripe/config"

export function createClient() {
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
    throw new Error("User not found")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!profile) {
    throw new Error("Profile not found")
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

    [VALID_ENV_KEYS.OPENAI_ORGANIZATION_ID]: "openai_organization_id",

    [VALID_ENV_KEYS.AZURE_OPENAI_ENDPOINT]: "azure_openai_endpoint",
    [VALID_ENV_KEYS.AZURE_GPT_35_TURBO_NAME]: "azure_openai_35_turbo_id",
    [VALID_ENV_KEYS.AZURE_GPT_45_VISION_NAME]: "azure_openai_45vision_id",
    [VALID_ENV_KEYS.AZURE_GPT_45_TURBO_NAME]: "azure_openai_45_turbo_id",
    [VALID_ENV_KEYS.AZURE_EMBEDDINGS_NAME]: "azure_openai_embeddings_id"
  }

  for (const [envKey, profileKey] of Object.entries(apiKeys)) {
    if (process.env[envKey] && !(profile as any)[profileKey]) {
      ;(profile as any)[profileKey] = process.env[envKey]
    }
  }

  return profile
}

export function checkApiKey(apiKey: string | null, keyName: string) {
  if (apiKey === null || apiKey === "") {
    throw new Error(`${keyName} API Key not found`)
  }
}

function getEnvInt(varName: string, def: number) {
  if (varName in process.env) {
    return parseInt(process.env[varName] + "")
  }

  return def
}

const FREE_MESSAGE_DAILY_LIMIT = getEnvInt("FREE_MESSAGE_LIMIT", 30)
const PRO_MESSAGE_DAILY_LIMIT = getEnvInt("PRO_MESSAGE_LIMIT", 50)
const CATCHALL_MESSAGE_DAILY_LIMIT = getEnvInt(
  "CATCHALL_MESSAGE_DAILY_LIMIT",
  300
)

// Updated validateModel function
export async function validateModel(profile: Tables<"profiles">, model: LLMID) {
  const { plan } = profile
  const modelTier = getModelTier(model)

  if (validateProPlan(profile)) {
    return // Pro users have unlimited access to all tiers
  }

  if (plan === PLAN_FREE && modelTier === ModelTier.Tier1) {
    throw new SubscriptionRequiredError("Pro plan required to use this model")
  }
}

// Updated validateMessageCount function
export async function validateMessageCount(
  profile: Tables<"profiles">,
  model: LLMID,
  date: Date,
  supabase: SupabaseClient
) {
  const { plan } = profile
  const modelTier = getModelTier(model)
  const isPro = validateProPlan(profile)

  let previousDate = new Date(date.getTime() - 24 * 60 * 60 * 1000)

  // Count all messages
  const { count: totalCount } = await supabase
    .from("messages")
    .select("*", { count: "exact" })
    .eq("role", "user")
    .gte("created_at", previousDate.toISOString())

  // Count messages for the specific tier
  const { count: tierCount } = await supabase
    .from("messages")
    .select("*", { count: "exact" })
    .eq("role", "user")
    .in(
      "model",
      LLM_LIST.filter(m => getModelTier(m.modelId) === modelTier).map(
        m => m.modelId
      )
    )
    .gte("created_at", previousDate.toISOString())

  if (totalCount === null || tierCount === null) {
    throw new Error("Could not fetch message count")
  }

  if (!isPro && totalCount >= FREE_CATCHALL_DAILY_LIMIT) {
    throw new SubscriptionRequiredError(
      `You have reached the overall daily message limit. Upgrade to Pro plan to continue or come back tomorrow.`
    )
  }

  if (
    modelTier === ModelTier.Tier1 &&
    isPro &&
    tierCount >= PRO_TIER1_DAILY_LIMIT
  ) {
    throw new SubscriptionRequiredError(
      `You have reached the daily message limit for Tier 1 models. Please try again tomorrow.`
    )
  }

  if (
    modelTier === ModelTier.Tier2 &&
    isPro &&
    tierCount >= PRO_TIER2_DAILY_LIMIT
  ) {
    throw new SubscriptionRequiredError(
      `You have reached the daily message limit for Tier 2 models. Please try again tomorrow.`
    )
  }

  if (modelTier === ModelTier.Tier3) {
    if (!isPro && tierCount >= FREE_TIER3_DAILY_LIMIT) {
      throw new SubscriptionRequiredError(
        `You have reached the daily message limit for Tier 3 models. Upgrade to Pro plan to continue or come back tomorrow.`
      )
    }
  }
}

// Updated validateModelAndMessageCount function
export async function validateModelAndMessageCount(model: LLMID, date: Date) {
  const client = createClient()
  const profile = await getServerProfile()
  await validateModel(profile, model)
  await validateMessageCount(profile, model, date, client)
}
