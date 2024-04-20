import { LLM } from "@/types"

const GROQ_PLATORM_LINK = "https://groq.com/"

const LLaMA2_70B: LLM = {
  modelId: "llama2-70b-4096",
  modelName: "Meta LLama 2 70B",
  provider: "groq",
  hostedId: "llama2-70b-4096",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false
}

const MIXTRAL_8X7B: LLM = {
  modelId: "mixtral-8x7b-32768",
  modelName: "Mixtral 8x7b Instruct",
  provider: "groq",
  hostedId: "mixtral-8x7b-32768",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false
}

const META_LLAMA_3_70B_8192: LLM = {
  modelId: "llama3-70b-8192",
  modelName: "Meta LLama 3 70B",
  provider: "groq",
  hostedId: "llama3-70b-8192",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false
}

export const GROQ_LLM_LIST: LLM[] = [
  LLaMA2_70B,
  MIXTRAL_8X7B,
  META_LLAMA_3_70B_8192
]
