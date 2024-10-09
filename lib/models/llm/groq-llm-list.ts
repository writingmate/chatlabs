import { LLM } from "@/types"
import { CATEGORIES } from "../categories"

const GROQ_PLATORM_LINK = "https://groq.com/"

const MIXTRAL_8X7B: LLM = {
  modelId: "mixtral-8x7b-32768",
  modelName: "Mixtral 8x7b Instruct",
  provider: "groq",
  hostedId: "mixtral-8x7b-32768",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.24,
    outputCost: 0.24
  },
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.ACADEMIA,
    CATEGORIES.PROGRAMMING
  ],
  description:
    "A pretrained generative Sparse Mixture of Experts, by Mistral AI, for chat and instruction use. Incorporates 8 experts (feed-forward networks) for a total of 47 billion parameters."
}

const META_LLAMA_3_8B_8192: LLM = {
  modelId: "llama3-8b-8192",
  modelName: "Meta LLama 3 8B",
  provider: "groq",
  hostedId: "llama3-8b-8192",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false,
  tools: true,
  supportsStreaming: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.05,
    outputCost: 0.1
  },
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.PROGRAMMING,
    CATEGORIES.PROGRAMMING_SCRIPTING
  ],
  description:
    "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version is fast and efficient."
}

const META_LLAMA_3_70B_8192: LLM = {
  modelId: "llama3-70b-8192",
  modelName: "Meta LLama 3 70B",
  provider: "groq",
  hostedId: "llama3-70b-8192",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false,
  tools: true,
  supportsStreaming: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.59,
    outputCost: 0.79
  },
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.ACADEMIA,
    CATEGORIES.LEGAL,
    CATEGORIES.FINANCE,
    CATEGORIES.PROGRAMMING,
    CATEGORIES.PROGRAMMING_SCRIPTING
  ],
  description:
    "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version is fast and efficient."
}

const LLAMA3_GROQ_70B_VERSATILE: LLM = {
  modelId: "llama-3.1-70b-versatile",
  modelName: "Llama 3.1 70B (Preview)",
  provider: "groq",
  hostedId: "llama-3.1-70b-versatile",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false,
  tools: false,
  supportsStreaming: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.59,
    outputCost: 0.79
  }
}

const LLAMA3_GROQ_70B_8192_TOOL_USE_PREVIEW: LLM = {
  modelId: "llama3-groq-70b-8192-tool-use-preview",
  modelName: "Meta LLama 3 70B Tool Use Preview",
  provider: "groq",
  hostedId: "llama3-groq-70b-8192-tool-use-preview",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false,
  tools: true,
  supportsStreaming: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.59,
    outputCost: 0.79
  }
}

export const GROQ_LLM_LIST: LLM[] = [
  MIXTRAL_8X7B,
  META_LLAMA_3_8B_8192,
  META_LLAMA_3_70B_8192,
  LLAMA3_GROQ_70B_VERSATILE,
  LLAMA3_GROQ_70B_8192_TOOL_USE_PREVIEW
]
