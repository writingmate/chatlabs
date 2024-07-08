import { Tables } from "@/supabase/types"
import { LLMID } from "@/types"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { PLAN_FREE } from "@/lib/stripe/config"

export function validateProPlan(profile: Tables<"profiles"> | null) {
  return profile?.plan !== PLAN_FREE && profile?.plan?.indexOf("premium") === -1
}

// Define model tiers
export enum ModelTier {
  Tier1 = 1,
  Tier2 = 2,
  Tier3 = 3
}

// Define message limits
export const FREE_TIER3_DAILY_LIMIT = 30
export const FREE_TIER2_LIMIT = 10
export const FREE_CATCHALL_DAILY_LIMIT = 50
export const PRO_TIER1_DAILY_LIMIT = 50
export const PRO_TIER2_DAILY_LIMIT = 100

// Define price thresholds for tiers
const TIER2_THRESHOLD = 1.1 // $0.01 per 1K tokens
const TIER1_THRESHOLD = 5.1 // $0.05 per 1K tokens

// Helper function to get model tier based on inputCost
export function getModelTier(model: LLMID): ModelTier {
  const llm = LLM_LIST.find(llm => llm.modelId === model)
  if (!llm) throw new Error(`Unknown model: ${model}`)

  const inputCost = llm.pricing?.inputCost

  console.log("inputCost", inputCost)

  if (inputCost === undefined) return ModelTier.Tier1

  if (inputCost < TIER2_THRESHOLD) return ModelTier.Tier3
  if (inputCost < TIER1_THRESHOLD) return ModelTier.Tier2
  return ModelTier.Tier1
}

export function validatePlanForModel(
  profile: Tables<"profiles"> | null,
  model?: LLMID
) {
  if (!model) {
    return false
  }

  const paidLLMS = LLM_LIST.filter(x => x.paid).map(x => x.modelId)

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

export function isPaidModel(model: LLMID) {
  const paidLLMS = LLM_LIST.filter(x => x.paid).map(x => x.modelId)
  return paidLLMS.includes(model)
}
