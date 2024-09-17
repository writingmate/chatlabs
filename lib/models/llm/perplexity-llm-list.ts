import { LLM } from "@/types"

const PERPLEXITY_PLATORM_LINK =
  "https://docs.perplexity.ai/docs/getting-started"

const MIXTRAL_8X7B_INSTRUCT: LLM = {
  modelId: "mixtral-8x7b-instruct",
  modelName: "Mixtral 8x7B Instruct",
  provider: "perplexity",
  hostedId: "mixtral-8x7b-instruct",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false,
  tier: "pro"
}

const MISTRAL_7B_INSTRUCT: LLM = {
  modelId: "mistral-7b-instruct",
  modelName: "Mistral 7B Instruct",
  provider: "perplexity",
  hostedId: "mistral-7b-instruct",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false
}

const PERPLEXITY_SONAR_SMALL_CHAT_7B: LLM = {
  modelId: "llama-3-sonar-small-32k-chat",
  modelName: "Sonar Small Chat",
  provider: "perplexity",
  hostedId: "llama-3-sonar-small-32k-chat",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false
}

const PERPLEXITY_SONAR_SMALL_ONLINE_7B: LLM = {
  modelId: "llama-3-sonar-small-32k-online",
  modelName: "Sonar Small Online",
  provider: "perplexity",
  hostedId: "llama-3-sonar-small-32k-online",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false
}

const PERPLEXITY_SONAR_LARGE_CHAT_8x7B: LLM = {
  modelId: "llama-3-sonar-large-32k-chat",
  modelName: "Sonar Large Chat",
  provider: "perplexity",
  hostedId: "llama-3-sonar-large-32k-chat",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false,
  tier: "pro"
}

const PERPLEXITY_SONAR_LARGE_ONLINE_8x7B: LLM = {
  modelId: "llama-3-sonar-large-32k-online",
  modelName: "Sonar Large Online",
  provider: "perplexity",
  hostedId: "llama-3-sonar-large-32k-online",
  platformLink: PERPLEXITY_PLATORM_LINK,
  imageInput: false,
  tier: "pro"
}

export const PERPLEXITY_LLM_LIST: LLM[] = [
  MIXTRAL_8X7B_INSTRUCT,
  MISTRAL_7B_INSTRUCT,
  PERPLEXITY_SONAR_SMALL_CHAT_7B,
  PERPLEXITY_SONAR_SMALL_ONLINE_7B,
  PERPLEXITY_SONAR_LARGE_CHAT_8x7B,
  PERPLEXITY_SONAR_LARGE_ONLINE_8x7B
]
