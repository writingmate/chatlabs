import { LLM } from "@/types"
import { CATEGORIES } from "../categories"

const PERPLEXITY_PLATORM_LINK =
  "https://docs.perplexity.ai/docs/getting-started"

const MIXTRAL_8X7B_INSTRUCT: LLM = {
  modelId: "mixtral-8x7b-instruct",
  modelName: "Mixtral 8x7B Instruct",
  provider: "perplexity",
  hostedId: "mixtral-8x7b-instruct",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false,
  tier: "pro",
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.ACADEMIA,
    CATEGORIES.PROGRAMMING,
    CATEGORIES.PROGRAMMING_SCRIPTING
  ],
  description:
    "A pretrained generative Sparse Mixture of Experts, by Mistral AI, for chat and instruction use. Incorporates 8 experts (feed-forward networks) for a total of 47 billion parameters."
}

const MISTRAL_7B_INSTRUCT: LLM = {
  modelId: "mistral-7b-instruct",
  modelName: "Mistral 7B Instruct",
  provider: "perplexity",
  hostedId: "mistral-7b-instruct",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false,
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.PROGRAMMING
  ],
  description:
    "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length."
}

const PERPLEXITY_SONAR_SMALL_CHAT_7B: LLM = {
  modelId: "llama-3-sonar-small-32k-chat",
  modelName: "Sonar Small Chat",
  provider: "perplexity",
  hostedId: "llama-3-sonar-small-32k-chat",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false,
  categories: [
    CATEGORIES.TECHNOLOGY,
    CATEGORIES.SCIENCE,
    CATEGORIES.ACADEMIA,
    CATEGORIES.PROGRAMMING
  ],
  description:
    "Llama3 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance."
}

const PERPLEXITY_SONAR_SMALL_ONLINE_7B: LLM = {
  modelId: "llama-3-sonar-small-32k-online",
  modelName: "Sonar Small Online",
  provider: "perplexity",
  hostedId: "llama-3-sonar-small-32k-online",
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
    "This is the online version of the Sonar Small Chat model. It is focused on delivering helpful, up-to-date, and factual responses."
}

const PERPLEXITY_SONAR_LARGE_CHAT_8x7B: LLM = {
  modelId: "llama-3-sonar-large-32k-chat",
  modelName: "Sonar Large Chat",
  provider: "perplexity",
  hostedId: "llama-3-sonar-large-32k-chat",
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
    "Llama3 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance."
}

const PERPLEXITY_SONAR_LARGE_ONLINE_8x7B: LLM = {
  modelId: "llama-3-sonar-large-32k-online",
  modelName: "Sonar Large Online",
  provider: "perplexity",
  hostedId: "llama-3-sonar-large-32k-online",
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
    "This is the online version of the Sonar Large Chat model. It is focused on delivering helpful, up-to-date, and factual responses."
}

export const PERPLEXITY_LLM_LIST: LLM[] = [
  MIXTRAL_8X7B_INSTRUCT,
  MISTRAL_7B_INSTRUCT,
  PERPLEXITY_SONAR_SMALL_CHAT_7B,
  PERPLEXITY_SONAR_SMALL_ONLINE_7B,
  PERPLEXITY_SONAR_LARGE_CHAT_8x7B,
  PERPLEXITY_SONAR_LARGE_ONLINE_8x7B
]
