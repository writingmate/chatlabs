import { LLM } from "@/types"
import { CATEGORIES } from "../categories"
import { LLMTier } from "@/types"

const OPENROUTER_PLATFORM_LINK = "https://openrouter.ai/api/v1"

const O1_MINI: LLM = {
  modelId: "openai/o1-mini",
  modelName: "O1 Mini",
  provider: "openrouter",
  hostedId: "o1-mini",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  tier: "pro" as LLMTier,
  new: true,
  categories: [CATEGORIES.TECHNOLOGY]
}

const O1_PREVIEW: LLM = {
  modelId: "openai/o1-preview",
  modelName: "O1 Preview",
  provider: "openrouter",
  hostedId: "o1-preview",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  tier: "pro" as LLMTier,
  new: true
}

const GPT_4O: LLM = {
  modelId: "openai/gpt-4o-2024-08-06",
  modelName: "GPT-4o 2024-08-06",
  provider: "openrouter",
  hostedId: "gpt-4o",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: true,
  tier: "pro" as LLMTier,
  supportsStreaming: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 2.5,
    outputCost: 10
  }
}

const GPT_4O_MINI: LLM = {
  modelId: "openai/gpt-4o-mini",
  modelName: "GPT-4o mini",
  provider: "openrouter",
  hostedId: "gpt-4o-mini",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: true,
  tier: "free" as LLMTier,
  supportsStreaming: true,
  new: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.15,
    outputCost: 0.6
  }
}

const GPT_4_VISION: LLM = {
  modelId: "openai/gpt-4-vision-preview",
  modelName: "GPT-4 Vision",
  provider: "openrouter",
  hostedId: "gpt-4-vision-preview",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tier: "pro" as LLMTier,
  tools: false,
  supportsStreaming: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 10
  }
}

///google
const GEMINI_PRO_15: LLM = {
  modelId: "google/gemini-pro-1.5",
  modelName: "Gemini 1.5 Pro",
  provider: "openrouter",
  hostedId: "gemini-1.5-pro-latest",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: false,
  supportsStreaming: true,
  tier: "pro" as LLMTier
}

const GEMINI_PRO_15_EXP: LLM = {
  modelId: "google/gemini-pro-1.5-exp",
  modelName: "Gemini 1.5 Pro Exp",
  provider: "openrouter",
  hostedId: "gemini-1.5-pro-exp",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: false,
  supportsStreaming: true,
  tier: "pro" as LLMTier
}

const GEMINI_FLASH_15_EXP: LLM = {
  modelId: "google/gemini-flash-1.5-exp",
  modelName: "Gemini Flash 1.5 Exp",
  provider: "openrouter",
  hostedId: "gemini-flash-1.5-exp",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: false,
  supportsStreaming: true,
  tier: "free" as LLMTier
}

///anthropic
const CLAUDE_3_HAIKU: LLM = {
  modelId: "anthropic/claude-3-haiku",
  modelName: "Claude 3 Haiku",
  provider: "openrouter",
  hostedId: "claude-3-haiku",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: false,
  supportsStreaming: true,
  tier: "free" as LLMTier
}

const CLAUDE_35_SONNET: LLM = {
  modelId: "anthropic/claude-3.5-sonnet",
  modelName: "Claude 3.5 Sonnet",
  provider: "openrouter",
  hostedId: "claude-3.5-sonnet",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: true,
  supportsStreaming: true,
  tier: "pro" as LLMTier
}

///other
const DBRX_INSTRUCT: LLM = {
  modelId: "databricks/dbrx-instruct",
  modelName: "DBRX Instruct",
  provider: "openrouter",
  hostedId: "dbrx-instruct",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  tier: "free" as LLMTier
}

const MIXTRAL_8X22B: LLM = {
  modelId: "mistralai/mixtral-8x22b-instruct",
  modelName: "Mixtral 8x22B",
  provider: "openrouter",
  hostedId: "mixtral-8x22b-instruct",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  tier: "free" as LLMTier
}
const WIZARDLM_2_8X22B: LLM = {
  modelId: "microsoft/wizardlm-2-8x22b",
  modelName: "WizardLM 2 8x22B",
  provider: "openrouter",
  hostedId: "wizardlm-2-8x22b",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  tier: "free" as LLMTier
}

const META_LLAMA_3_1_405B: LLM = {
  modelId: "meta-llama/llama-3.1-405b-instruct",
  modelName: "Meta Llama 3.1 405B",
  provider: "openrouter",
  hostedId: "llama-3.1-405b-instruct",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  tier: "free" as LLMTier
}

const LLAMA_3_1_SONAR_HUGE_128K_ONLINE: LLM = {
  modelId: "perplexity/llama-3.1-sonar-huge-128k-online",
  modelName: "Llama 3.1 Sonar 405B Online",
  provider: "openrouter",
  hostedId: "llama-3.1-sonar-405b-online",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  tier: "pro" as LLMTier
}

const DEEPSEEK_CHAT: LLM = {
  modelId: "deepseek/deepseek-chat",
  modelName: "DeepSeek v2.5",
  provider: "openrouter",
  hostedId: "DeepSeek V2.5",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  tier: "free" as LLMTier
}

const LLAMA_32_90B_VISION: LLM = {
  modelId: "meta-llama/llama-3.2-90b-vision-instruct",
  modelName: "Llama 3.2 90B Vision",
  provider: "openrouter",
  hostedId: "llama-3.2-90b-vision-instruct",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: false,
  supportsStreaming: true,
  tier: "pro" as LLMTier
}

const LLAMA_32_11B_VISION: LLM = {
  modelId: "meta-llama/llama-3.2-11b-vision-instruct",
  modelName: "Llama 3.2 11B Vision",
  provider: "openrouter",
  hostedId: "llama-3.2-11b-vision-instruct",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: false,
  supportsStreaming: true,
  tier: "free" as LLMTier
}

const QWEN_25_72B: LLM = {
  modelId: "qwen/qwen-2.5-72b-instruct",
  modelName: "Qwen 2.5 72B",
  provider: "openrouter",
  hostedId: "qwen-2.5-72b-instruct",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  tier: "pro" as LLMTier
}

const QWEN_2_VL_72B: LLM = {
  modelId: "qwen/qwen-2-vl-72b-instruct",
  modelName: "Qwen 2 VL 72B",
  provider: "openrouter",
  hostedId: "qwen-2-vl-72b-instruct",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: false,
  supportsStreaming: true,
  tier: "pro" as LLMTier
}

const COHERE_COMMAND_R_PLUS: LLM = {
  modelId: "cohere/command-r-plus-08-2024",
  modelName: "Command-R Plus (08/2024)",
  provider: "openrouter",
  hostedId: "command-r-plus-08-2024",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  tier: "pro" as LLMTier
}

const COHERE_COMMAND_R: LLM = {
  modelId: "cohere/command-r-08-2024",
  modelName: "Command-R (08/2024)",
  provider: "openrouter",
  hostedId: "command-r-08-2024",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  tier: "free" as LLMTier
}

const GEMINI_FLASH_15_8B: LLM = {
  modelId: "google/gemini-flash-1.5-8b",
  modelName: "Gemini Flash 1.5 8B",
  provider: "openrouter",
  hostedId: "gemini-flash-1.5-8b",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  tier: "free" as LLMTier
}

const MYTHOMAX_13B: LLM = {
  modelId: "mythic/mythomax-13b",
  modelName: "Mythomax 13B",
  provider: "openrouter",
  hostedId: "mythomax-13b",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  tier: "free" as LLMTier
}

export const OPENROUTER_LLM_LIST: LLM[] = [
  O1_MINI,
  O1_PREVIEW,
  GPT_4O,
  GPT_4O_MINI,
  GPT_4_VISION,
  GEMINI_PRO_15,
  GEMINI_PRO_15_EXP,
  GEMINI_FLASH_15_EXP,
  GEMINI_FLASH_15_8B,
  CLAUDE_3_HAIKU,
  CLAUDE_35_SONNET,
  LLAMA_3_1_SONAR_HUGE_128K_ONLINE,
  META_LLAMA_3_1_405B,
  LLAMA_32_90B_VISION,
  LLAMA_32_11B_VISION,
  DEEPSEEK_CHAT,
  QWEN_25_72B,
  QWEN_2_VL_72B,
  COHERE_COMMAND_R_PLUS,
  COHERE_COMMAND_R,
  DBRX_INSTRUCT,
  MIXTRAL_8X22B,
  WIZARDLM_2_8X22B,
  MYTHOMAX_13B
]

//- openai/gpt-4o-2024-08-06
//- openai/gpt-4o-mini
//- openai/gpt-4-vision-preview
//- google/gemini-pro-1.5
//- google/gemini-pro-1.5-exp
//- google/gemini-flash-1.5-exp
//- google/gemini-pro-vision
//- anthropic/claude-3-haiku
//- anthropic/claude-3.5-sonnet
//- meta-llama/llama-3.1-405b-instruct
//- deepseek/deepseek-chat
//- openai/o1-mini
//- openai/o1-preview
//- google/gemini-pro-1.5-exp
//- google/gemini-flash-1.5-exp
