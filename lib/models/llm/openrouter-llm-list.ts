import { LLM } from "@/types"

const OPENROUTER_PLATFORM_LINK = "https://openrouter.ai/api/v1"

const GPT4O: LLM = {
  modelId: "openai/gpt-4o-2024-05-13",
  modelName: "GPT-4o",
  provider: "openrouter",
  hostedId: "gpt-4o",
  platformLink: OPENROUTER_PLATFORM_LINK,
  imageInput: true,
  tools: true,
  paid: true,
  supportsStreaming: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 5.0,
    outputCost: 15.0
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
  supportsStreaming: true,
  paid: true
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

export const OPENROUTER_LLM_LIST: LLM[] = [
  GPT4O,
  GPT4Vision,
  GEMINI_PRO_15,
  CLAUDE_3_HAIKU,
  CLAUDE_35_SONNET,
  LLAVA_YI_34b,
  FIRELLAVA_13b
]
//- openai/gpt-4o-2024-05-13
//- openai/gpt-4-vision-preview
//- google/gemini-pro-1.5
//- google/gemini-pro-vision
//- liuhaotian/llava-yi-34b
//- fireworks/firellava-13b
//- anthropic/claude-3-haiku
//- anthropic/claude-3.5-sonnet
