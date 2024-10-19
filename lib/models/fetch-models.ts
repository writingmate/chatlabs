import { Tables } from "@/supabase/types"
import { LLM, LLMID, ModelProvider, OpenRouterLLM } from "@/types"
import { toast } from "sonner"
import { LLM_LIST_MAP } from "./llm/llm-list"
import { CATEGORIES } from "./categories"
import { PLAN_FREE } from "../stripe/config"
import { PLAN_PRO, PLAN_ULTIMATE } from "../stripe/config"
import { number } from "zod"

const KNOWN_MODEL_NAMES: {
  [key: string]: Partial<LLM>
} = {
  "databricks/dbrx-instruct": {
    provider: "databricks",
    modelName: "DBRX Instruct"
  },
  "cohere/command-r-plus": {
    provider: "cohere",
    modelName: "Command R Plus"
  },
  "mistralai/mixtral-8x22b-instruct": {
    provider: "mistral",
    modelName: "Mixtral 8x22B"
  },
  "meta-llama/llama-3-70b-instruct": {
    provider: "meta",
    modelName: "Meta Llama 3 70B"
  },
  "microsoft/wizardlm-2-8x22b": {
    provider: "microsoft",
    modelName: "WizardLM 2 8x22B"
  },
  "deepseek/deepseek-coder": {
    provider: "deepseek",
    modelName: "DeepSeek Coder V2",
    categories: [CATEGORIES.PROGRAMMING]
  },
  "gryphe/mythomax-l2-13b": {
    provider: "gryphe" as any,
    modelName: "Mythomax 13B",
    categories: [CATEGORIES.ROLEPLAY]
  }
}

export const fetchHostedModels = async (
  profile: Tables<"profiles"> | null | undefined
) => {
  try {
    const providers = ["google", "anthropic", "mistral", "groq", "perplexity"]

    if (profile?.use_azure_openai) {
      providers.push("azure")
    } else {
      providers.push("openai")
    }

    const response = await fetch("/api/keys")

    if (!response.ok) {
      throw new Error(`Server is not responding.`)
    }

    const data = await response.json()

    let modelsToAdd: LLM[] = []

    for (const provider of providers) {
      const models = LLM_LIST_MAP[provider]

      if (!Array.isArray(models)) {
        continue
      }

      if (profile) {
        let providerKey: keyof typeof profile

        if (provider === "google") {
          providerKey = "google_gemini_api_key"
        } else if (provider === "azure") {
          providerKey = "azure_openai_api_key"
        } else {
          providerKey = `${provider}_api_key` as keyof typeof profile
        }

        if (profile?.[providerKey]) {
          modelsToAdd.push(...models)
          continue
        }
      }

      if (data.isUsingEnvKeyMap[provider]) {
        modelsToAdd.push(...models)
      }
    }

    return {
      envKeyMap: data.isUsingEnvKeyMap,
      hostedModels: modelsToAdd
    }
  } catch (error) {
    console.warn("Error fetching hosted models: " + error)
  }
}

export const fetchOllamaModels = async () => {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_OLLAMA_URL + "/api/tags"
    )

    if (!response.ok) {
      throw new Error(`Ollama server is not responding.`)
    }

    const data = await response.json()

    const localModels: LLM[] = data.models.map((model: any) => ({
      modelId: model.name as LLMID,
      modelName: model.name,
      provider: "ollama",
      hostedId: model.name,
      platformLink: "https://ollama.ai/library",
      imageInput: false
    }))

    return localModels
  } catch (error) {
    console.warn("Error fetching Ollama models: " + error)
  }
}

export const fetchOpenRouterModels = async () => {
  try {
    const response = await fetch("/api/openrouter-models")

    if (!response.ok) {
      throw new Error(`Server is not responding. Status: ${response.status}`)
    }

    const { data } = await response.json()
    return data as OpenRouterLLM[]
  } catch (error) {
    console.error("Error fetching Open Router models: " + error)
    toast.error("Error fetching Open Router models: " + error)
    return [] // Return an empty array in case of error
  }
}
