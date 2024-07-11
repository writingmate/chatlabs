import { Tables } from "@/supabase/types"
import { LLMID } from "@/types"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { PLAN_FREE } from "@/lib/stripe/config"
import { getEnvInt } from "@/lib/env"

export const FREE_MESSAGE_DAILY_LIMIT = getEnvInt(
  "FREE_MESSAGE_DAILY_LIMIT",
  30
)
export const PRO_MESSAGE_DAILY_LIMIT = getEnvInt("PRO_MESSAGE_DAILY_LIMIT", 50)
export const CATCHALL_MESSAGE_DAILY_LIMIT = getEnvInt(
  "CATCHALL_MESSAGE_DAILY_LIMIT",
  300
)

export const ALLOWED_USERS =
  process.env.NEXT_PUBLIC_ALLOWED_USERS?.split(",") || []
export const ALLOWED_MODELS =
  process.env.NEXT_PUBLIC_ALLOWED_MODELS?.split(",") || []

export function validateProPlan(profile: Tables<"profiles"> | null) {
  if (!profile) {
    return false
  }

  if (ALLOWED_USERS.includes(profile?.user_id)) {
    return true
  }

  return profile?.plan !== PLAN_FREE && profile?.plan?.indexOf("premium") === -1
}

export function validatePlanForModel(
  profile: Tables<"profiles"> | null,
  model?: LLMID
) {
  if (!model) {
    return false
  }

  const paidLLMS = LLM_LIST.filter(x => x.paid).map(x => x.modelId)

  if (ALLOWED_MODELS.includes(model)) {
    console.log("ALLOWED MODELS. Skipping plan check.", model)
    return true
  }

  if (!paidLLMS.includes(model)) {
    return true
  }

  if (!profile) {
    return false
  }

  if (validateProPlan(profile)) {
    return true
  }
}

export function validatePlanForAssistant(
  profile: Tables<"profiles"> | null,
  assistant: Tables<"assistants">
) {
  return validatePlanForModel(profile, assistant.model as LLMID)
}

export function validatePlanForTools(
  profile: Tables<"profiles"> | null,
  tools: any[]
) {
  return validateProPlan(profile)
}
