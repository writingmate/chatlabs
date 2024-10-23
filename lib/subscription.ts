import { LLMID } from "@/types/llms"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { PLAN_FREE, PLAN_PRO, PLAN_ULTIMATE } from "@/lib/stripe/config"
import { getEnvInt } from "@/lib/env"
import { Tables } from "@/supabase/types"

export const FREE_MESSAGE_DAILY_LIMIT = getEnvInt(
  "FREE_MESSAGE_DAILY_LIMIT",
  30
)
export const PRO_MESSAGE_DAILY_LIMIT = getEnvInt("PRO_MESSAGE_DAILY_LIMIT", 50)
export const CATCHALL_MESSAGE_DAILY_LIMIT = getEnvInt(
  "CATCHALL_MESSAGE_DAILY_LIMIT",
  300
)
export const PRO_ULTIMATE_MESSAGE_DAILY_LIMIT = getEnvInt(
  "PRO_ULTIMATE_MESSAGE_DAILY_LIMIT",
  5
)
export const ULTIMATE_MESSAGE_DAILY_LIMIT = getEnvInt(
  "ULTIMATE_MESSAGE_DAILY_LIMIT",
  50
)

export const ALLOWED_USERS =
  process.env.NEXT_PUBLIC_ALLOWED_USERS?.split(",") || []
export const ALLOWED_MODELS =
  process.env.NEXT_PUBLIC_ALLOWED_MODELS?.split(",") || []

// Helper function to get effective plan
export function getEffectivePlan(
  profile: Tables<"profiles">,
  workspace: Tables<"workspaces"> | null
): string {
  return (
    (profile.workspace_migration_enabled ? workspace?.plan : profile.plan) ||
    PLAN_FREE
  )
}

export function validatePlanForModel(plan: string | null, model?: LLMID) {
  if (!model) return false

  // openrouter models are always allowed
  if (model.includes("/")) return true

  if (plan?.startsWith("byok")) return true

  const modelData = LLM_LIST.find(
    x => x.modelId === model || x.hostedId === model
  )

  if (!modelData) return false

  if (ALLOWED_MODELS.includes(model)) {
    console.debug("ALLOWED MODELS. Skipping plan check.", model)
    return true
  }

  if (modelData.tier === "free" || modelData.tier === undefined) return true

  const userPlan = plan?.split("_")[0] || "free"
  if (userPlan === PLAN_ULTIMATE || userPlan === PLAN_PRO) return true

  return false
}

export function validatePlanForAssistant(
  plan: string | null,
  assistant: Tables<"assistants">
) {
  return validatePlanForModel(plan, assistant.model as LLMID)
}

export function validatePlanForTools(
  plan: string | null,
  tools: any[],
  model?: LLMID
) {
  if (model && validatePlanForModel(plan, model)) {
    return true
  }
  return false
}
