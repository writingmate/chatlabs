import { LLM } from "@/types"

import { CATEGORIES } from "../categories"

const PERPLEXITY_PLATORM_LINK =
  "https://docs.perplexity.ai/docs/getting-started"

const PERPLEXITY_SONAR_SMALL_CHAT: LLM = {
  modelId: "llama-3.1-sonar-small-128k-chat",
  modelName: "Sonar Small Chat",
  provider: "perplexity",
  hostedId: "llama-3.1-sonar-small-128k-chat",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false,
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.ACADEMIA,
    CATEGORIES.PROGRAMMING
  ],
  description:
    "Llama 3.1 Sonar Small Chat is an 8B parameter model with a 127,072 token context length, designed for chat completion tasks."
}

const PERPLEXITY_SONAR_SMALL_ONLINE: LLM = {
  modelId: "llama-3.1-sonar-small-128k-online",
  modelName: "Sonar Small Online",
  provider: "perplexity",
  hostedId: "llama-3.1-sonar-small-128k-online",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false,
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.ACADEMIA,
    CATEGORIES.TECHNOLOGY_WEB,
    CATEGORIES.PROGRAMMING
  ],
  description:
    "Llama 3.1 Sonar Small Online is an 8B parameter model with a 127,072 token context length, optimized for online chat completion tasks."
}

const PERPLEXITY_SONAR_LARGE_CHAT: LLM = {
  modelId: "llama-3.1-sonar-large-128k-chat",
  modelName: "Sonar Large Chat",
  provider: "perplexity",
  hostedId: "llama-3.1-sonar-large-128k-chat",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false,
  tier: "pro",
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
    "Llama 3.1 Sonar Large Chat is a 70B parameter model with a 127,072 token context length, designed for advanced chat completion tasks."
}

const PERPLEXITY_SONAR_LARGE_ONLINE: LLM = {
  modelId: "llama-3.1-sonar-large-128k-online",
  modelName: "Sonar Large Online",
  provider: "perplexity",
  hostedId: "llama-3.1-sonar-large-128k-online",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false,
  tier: "pro",
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.ACADEMIA,
    CATEGORIES.TECHNOLOGY_WEB,
    CATEGORIES.MARKETING_SEO,
    CATEGORIES.PROGRAMMING,
    CATEGORIES.PROGRAMMING_SCRIPTING
  ],
  description:
    "Llama 3.1 Sonar Large Online is a 70B parameter model with a 127,072 token context length, optimized for advanced online chat completion tasks."
}

const PERPLEXITY_SONAR_HUGE_ONLINE: LLM = {
  modelId: "llama-3.1-sonar-huge-128k-online",
  modelName: "Sonar Huge Online",
  provider: "perplexity",
  hostedId: "llama-3.1-sonar-huge-128k-online",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false,
  tier: "pro",
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.ACADEMIA,
    CATEGORIES.TECHNOLOGY_WEB,
    CATEGORIES.MARKETING_SEO,
    CATEGORIES.PROGRAMMING,
    CATEGORIES.PROGRAMMING_SCRIPTING
  ],
  description:
    "Llama 3.1 Sonar Huge Online is a 405B parameter model with a 127,072 token context length, designed for the most advanced online chat completion tasks."
}

export const PERPLEXITY_LLM_LIST: LLM[] = [
  PERPLEXITY_SONAR_SMALL_CHAT,
  PERPLEXITY_SONAR_SMALL_ONLINE,
  PERPLEXITY_SONAR_LARGE_CHAT,
  PERPLEXITY_SONAR_LARGE_ONLINE,
  PERPLEXITY_SONAR_HUGE_ONLINE
]
