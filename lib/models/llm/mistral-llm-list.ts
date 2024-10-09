import { LLM } from "@/types"
import { CATEGORIES } from "../categories"

const MISTRAL_PLATORM_LINK = "https://docs.mistral.ai/"

// Mistral Models (UPDATED 12/21/23) -----------------------------

// Mistral 7B (UPDATED 12/21/23)
const MISTRAL_7B: LLM = {
  modelId: "mistral-tiny",
  modelName: "Mistral Tiny",
  provider: "mistral",
  hostedId: "mistral-tiny",
  platformLink: MISTRAL_PLATORM_LINK,
  imageInput: false,
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.PROGRAMMING
  ],
  description:
    "This model is currently powered by Mistral-7B-v0.2, and incorporates a better fine-tuning than previous versions. It's best used for large batch processing tasks where cost is a significant factor but reasoning capabilities are not crucial."
}

// Mixtral (UPDATED 12/21/23)
const MIXTRAL: LLM = {
  modelId: "mistral-small",
  modelName: "Mistral Small",
  provider: "mistral",
  hostedId: "mistral-small",
  platformLink: MISTRAL_PLATORM_LINK,
  imageInput: false,
  tier: "pro",
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 2,
    outputCost: 6
  },
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.ACADEMIA,
    CATEGORIES.PROGRAMMING,
    CATEGORIES.TRANSLATION
  ],
  description:
    "Cost-efficient, fast, and reliable option for use cases such as translation, summarization, and sentiment analysis."
}

// Mistral Medium (UPDATED 12/21/23)
const MISTRAL_MEDIUM: LLM = {
  modelId: "mistral-medium",
  modelName: "Mistral Medium",
  provider: "mistral",
  hostedId: "mistral-medium",
  platformLink: MISTRAL_PLATORM_LINK,
  imageInput: false,
  tier: "pro",
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 2.7,
    outputCost: 8.1
  },
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.ACADEMIA,
    CATEGORIES.LEGAL,
    CATEGORIES.PROGRAMMING,
    CATEGORIES.PROGRAMMING_SCRIPTING
  ],
  description:
    "This is Mistral AI's closed-source, medium-sized model. It's powered by a closed-source prototype and excels at reasoning, code, JSON, chat, and more. In benchmarks, it compares with many of the flagship models of other companies."
}

// Mistral Large (UPDATED 03/05/24)
const MISTRAL_LARGE: LLM = {
  modelId: "mistral-large-latest",
  modelName: "Mistral Large",
  provider: "mistral",
  hostedId: "mistral-large-latest",
  platformLink: MISTRAL_PLATORM_LINK,
  imageInput: false,
  tier: "pro",
  tools: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 8,
    outputCost: 24
  },
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.ACADEMIA,
    CATEGORIES.LEGAL,
    CATEGORIES.FINANCE,
    CATEGORIES.HEALTH,
    CATEGORIES.PROGRAMMING,
    CATEGORIES.PROGRAMMING_SCRIPTING,
    CATEGORIES.TRANSLATION
  ],
  description:
    "This is Mistral AI's flagship model, Mistral Large 2. It's a proprietary weights-available model and excels at reasoning, code, JSON, chat, and more. It is fluent in English, French, Spanish, German, and Italian, with high grammatical accuracy, and its long context window allows precise information recall from large documents."
}

export const MISTRAL_LLM_LIST: LLM[] = [
  MISTRAL_7B,
  MIXTRAL,
  MISTRAL_MEDIUM,
  MISTRAL_LARGE
]
