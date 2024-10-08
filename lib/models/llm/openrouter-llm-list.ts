import { LLM } from "@/types"

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
  paid: true,
  new: true
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
  paid: true,
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
  paid: false,
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
  paid: false,
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
  paid: true,
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
  paid: true
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
  paid: true
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
  paid: false
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
  paid: false
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
  paid: true
}

///other
const LLAVA_YI_34b: LLM = {
  modelId: "liuhaotian/llava-yi-34b",
  modelName: "Llava-yi-34b",
  provider: "openrouter",
  hostedId: "llava-yi-34b",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: false,
  supportsStreaming: true,
  paid: false
}

const FIRELLAVA_13b: LLM = {
  modelId: "fireworks/firellava-13b",
  modelName: "Firellava-13b",
  provider: "openrouter",
  hostedId: "firellava-13b",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: false,
  supportsStreaming: true,
  paid: false
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
  paid: false
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
  paid: false
}

const REFLECTION_70B: LLM = {
  modelId: "mattshumer/reflection-70b",
  modelName: "Reflection 70B",
  provider: "openrouter",
  hostedId: "reflection-70b",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  paid: true,
  new: true
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
  paid: false
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
  CLAUDE_3_HAIKU,
  CLAUDE_35_SONNET,
  LLAVA_YI_34b,
  FIRELLAVA_13b,
  LLAMA_3_1_SONAR_HUGE_128K_ONLINE,
  META_LLAMA_3_1_405B,
  REFLECTION_70B,
  DEEPSEEK_CHAT
]

//- openai/gpt-4o-2024-08-06
//- openai/gpt-4o-mini
//- openai/gpt-4-vision-preview
//- google/gemini-pro-1.5
//- google/gemini-pro-1.5-exp
//- google/gemini-flash-1.5-exp
//- google/gemini-pro-vision
//- liuhaotian/llava-yi-34b
//- fireworks/firellava-13b
//- anthropic/claude-3-haiku
//- anthropic/claude-3.5-sonnet
//- meta-llama/llama-3.1-405b-instruct
//- deepseek/deepseek-chat
//- openai/o1-mini
//- openai/o1-preview
//- google/gemini-pro-1.5-exp
//- google/gemini-flash-1.5-exp
