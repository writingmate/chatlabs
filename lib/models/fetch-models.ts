import { Tables } from "@/supabase/types"
import { LLM, LLMID, OpenRouterLLM } from "@/types"
import { toast } from "sonner"
import { LLM_LIST_MAP } from "./llm/llm-list"

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
    new: true
  },
  "openai/gpt-4o-mini": {
    provider: "openai",
    modelName: "GPT-4o mini",
    imageInput: true,
    tools: true,
    paid: false,
    new: true,
    supportsStreaming: true
  },
  "anthropic/claude-3.5-sonnet": {
    provider: "anthropic",
    modelName: "Claude 3.5 Sonnet",
    new: true,
    imageInput: true
  }
}

export function parseOpenRouterModelName(modelId: string): Partial<LLM> {
  if (Object.keys(KNOWN_MODEL_NAMES).includes(modelId)) {
    return KNOWN_MODEL_NAMES[modelId]
  }

  const openRouterModelRegex = /^(.+)\/(.+)(:+)?$/
  const match = modelId?.match(openRouterModelRegex)
  const modelProvider = match ? match[1] : "openrouter"
  const modelName = match ? humanize(match[2]) : modelId

  return {
    provider: modelProvider as any,
    modelName
  }
}

function parseSupportedModelsFromEnv() {
  let SUPPORTED_OPENROUTER_MODELS = [
    "databricks/dbrx-instruct",
    "cohere/command-r-plus",
    "mistralai/mixtral-8x22b-instruct",
    "microsoft/wizardlm-2-8x22b",
    "meta-llama/llama-3-70b-instruct",
    "deepseek/deepseek-coder",
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4o-2024-05-13",
    "openai/gpt-4o-mini"
  ]

  if (process.env.NEXT_PUBLIC_OPENROUTER_MODELS) {
    SUPPORTED_OPENROUTER_MODELS = (
      process.env.NEXT_PUBLIC_OPENROUTER_MODELS + ""
    )
      .split(",")
      .map(model => model.trim())
  }

  return SUPPORTED_OPENROUTER_MODELS
}

function humanize(str: string) {
  str = str.replace(/-/g, " ")
  // Capitalize first letter of each word
  return str.replace(/\b\w/g, l => l.toUpperCase())
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

        if (!profile?.[providerKey]) {
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
    const response = await fetch("https://openrouter.ai/api/v1/models")

    if (!response.ok) {
      throw new Error(`OpenRouter server is not responding.`)
    }

    const { data } = await response.json()

    let SUPPORTED_OPENROUTER_MODELS = parseSupportedModelsFromEnv()

    const openRouterModels = data
      .map(
        (model: {
          id: string
          name: string
          context_length: number
          description: string
          pricing: {
            completion: string
            image: string
            prompt: string
          }
        }): OpenRouterLLM => ({
          modelId: model.id as LLMID,
          modelName: model.name,
          provider: "openrouter",
          hostedId: model.id,
          platformLink: "https://openrouter.dev",
          imageInput: true,
          maxContext: model.context_length,
          description: model.description,
          pricing: {
            currency: "USD",
            inputCost: parseFloat(model.pricing.prompt) * 1000000,
            outputCost: parseFloat(model.pricing.completion) * 1000000,
            unit: "1M tokens"
          }
        })
      )
      .filter(({ modelId }: { modelId: string }) =>
        SUPPORTED_OPENROUTER_MODELS.includes(modelId)
      )
      .map((model: any) => {
        const { modelName } = parseOpenRouterModelName(model.modelId)
        return {
          ...model,
          modelName
        }
      })

    return openRouterModels
  } catch (error) {
    console.error("Error fetching Open Router models: " + error)
    toast.error("Error fetching Open Router models: " + error)
  }
}
