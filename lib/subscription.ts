import { Tables } from "@/supabase/types"
import { LLMID } from "@/types"
import { LLM_LIST } from "@/lib/models/llm/llm-list"

export function validatePlanForModel(
  profile: Tables<"profiles"> | null,
  model?: LLMID
) {
  if (!profile) {
    return false
  }

  if (!model) {
    return false
  }

  if (profile?.plan !== "free" && profile?.plan?.indexOf("premium") === -1) {
    return true
  }

  const paidLLMS = LLM_LIST.filter(x => x.paid).map(x => x.modelId)

  return !paidLLMS.includes(model)
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
  return profile?.plan !== "free" && profile?.plan?.indexOf("premium") === -1
}
