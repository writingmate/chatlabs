import { LLM } from "@/types"

const OPENROUTER_PLATFORM_LINK = "https://openrouter.ai/api/v1"

const GPT4O: LLM = {
  modelId: "openai/gpt-4o-2024-08-06",
  modelName: "GPT-4o 2024-08-06",
  provider: "openrouter",
  hostedId: "gpt-4o",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: true,

  supportsStreaming: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 2.5,
    outputCost: 10
  }
}

const GPT4O_MINI: LLM = {
  modelId: "openai/gpt-4o-mini",
  modelName: "GPT-4o mini",
  provider: "openrouter",
  hostedId: "gpt-4o-mini",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: true,
  paid: false,
  supportsStreaming: true,
  new: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.15,
    outputCost: 0.6
  }
}

const GPT4Vision: LLM = {
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

const CLAUDE_3_HAIKU: LLM = {
  modelId: "anthropic/claude-3-haiku",
  modelName: "Claude 3 Haiku",
  provider: "openrouter",
  hostedId: "claude-3-haiku",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: false,
  supportsStreaming: true,
  paid: true
}

const CLAUDE_35_SONNET: LLM = {
  modelId: "anthropic/claude-3.5-sonnet",
  modelName: "Claude 3.5 Sonnet",
  provider: "openrouter",
  hostedId: "claude-3.5-sonnet",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: true,
  supportsStreaming: true
}

const LLAVA_YI_34b: LLM = {
  modelId: "liuhaotian/llava-yi-34b",
  modelName: "Llava-yi-34b",
  provider: "openrouter",
  hostedId: "llava-yi-34b",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: false,
  supportsStreaming: true,
  paid: true
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
  paid: true
}

const LLAMA_3_1_SONAR_HUGE_128K_ONLINE: LLM = {
  modelId: "perplexity/llama-3.1-sonar-huge-128k-online",
  modelName: "Llama 3.1 Sonar 405B Online",
  provider: "openrouter",
  hostedId: "llama-3.1-sonar-huge-128k-online",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  paid: true
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

export const OPENROUTER_LLM_LIST: LLM[] = [
  GPT4O,
  GPT4O_MINI,
  GPT4Vision,
  GEMINI_PRO_15,
  CLAUDE_3_HAIKU,
  CLAUDE_35_SONNET,
  LLAVA_YI_34b,
  FIRELLAVA_13b,
  LLAMA_3_1_SONAR_HUGE_128K_ONLINE,
  REFLECTION_70B
]
//- openai/gpt-4o-2024-08-06
//- openai/gpt-4o-mini
//- openai/gpt-4-vision-preview
//- google/gemini-pro-1.5
//- google/gemini-pro-vision
//- liuhaotian/llava-yi-34b
//- fireworks/firellava-13b
//- anthropic/claude-3-haiku
//- anthropic/claude-3.5-sonnet
//- meta-llama/llama-3.1-405b
