import { Tables } from "@/supabase/types"
import { LLM, LLMID, OpenRouterLLM } from "@/types"
import { toast } from "sonner"
import { LLM_LIST_MAP } from "./llm/llm-list"
import { CATEGORIES } from "./categories"
import { OPENROUTER_LLM_LIST } from "./llm/openrouter-llm-list"

const KNOWN_MODEL_NAMES: {
  [key: string]: Partial<LLM>
} = {
  "databricks/dbrx-instruct": {
    provider: "databricks",
    modelName: "DBRX Instruct"
  },
  "mistralai/mixtral-8x22b-instruct": {
    provider: "mistral",
    modelName: "Mixtral 8x22B"
  },
  "microsoft/wizardlm-2-8x22b": {
    provider: "microsoft",
    modelName: "WizardLM 2 8x22B"
  },
  "deepseek/deepseek-chat": {
    provider: "deepseek",
    modelName: "DeepSeek Chat V2.5",
    categories: [CATEGORIES.PROGRAMMING]
  },
  "gryphe/mythomax-l2-13b": {
    provider: "gryphe" as any,
    modelName: "Mythomax 13B",
    categories: [CATEGORIES.ROLEPLAY]
  },
  "meta-llama/llama-3.1-405b-instruct": {
    provider: "meta",
    modelName: "Meta Llama 3 405B"
  },
  "meta-llama/llama-3.2-90b-vision-instruct": {
    provider: "meta",
    modelName: "Meta Llama 3.2 90B"
  },
  "meta-llama/llama-3.2-11b-vision-instruct": {
    provider: "meta",
    modelName: "Meta Llama 3.2 11B"
  }
  ///"google/gemini-pro-1.5": {
  //provider: "google",
  //modelName: "Gemini Pro 1.5",
  //imageInput: true,
  //tools: false,
  //paid: true,
  //supportsStreaming: true
  //},
  //"openai/gpt-4o-2024-08-06": {
  //  provider: "openai",
  //  modelName: "GPT-4o 2024-08-06",
  //  imageInput: true,
  //  tools: false,
  //  new: true,
  //  supportsStreaming: true,
  //  paid: true
  //},
  ///"openai/gpt-4o-mini": {
  ///  provider: "openai",
  ///  modelName: "GPT-4o mini",
  //imageInput: true,
  //tools: true,
  //paid: false,
  //new: true,
  //supportsStreaming: true
  /// },
  ///"anthropic/claude-3.5-sonnet": {
  //provider: "anthropic",
  //modelName: "Claude 3.5 Sonnet",
  //new: true,
  //imageInput: true,
  //supportsStreaming: true
  //  },
  ///"perplexity/llama-3.1-sonar-huge-128k-online": {
  //provider: "perplexity",
  //modelName: "Llama 3.1 Sonar 405B Online",
  //new: true,
  //imageInput: false,
  //tools: false,
  //supportsStreaming: true,
  //paid: true
  //}
}
//add things to KNOWN_MODEL_NAMES casuse crash at this moment. Reason unknow

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
    "openai/o1-mini",
    "openai/o1-preview",
    "openai/gpt-4o-2024-08-06",
    "openai/gpt-4o-mini",

    "anthropic/claude-3.5-sonnet",
    "anthropic/claude-3-haiku",

    "google/gemini-pro-1.5",
    "google/gemini-pro-1.5-exp",
    "google/gemini-flash-1.5-exp",
    "google/gemini-flash-1.5-8b",

    "databricks/dbrx-instruct",
    "mistralai/mixtral-8x22b-instruct",
    "microsoft/wizardlm-2-8x22b",
    "meta-llama/llama-3.1-405b-instruct",
    "meta-llama/llama-3.2-90b-vision-instruct",
    "meta-llama/llama-3.2-11b-vision-instruct",
    "perplexity/llama-3.1-sonar-huge-128k-online",
    "deepseek/deepseek-chat",
    "qwen/qwen-2.5-72b-instruct",
    "qwen/qwen-2-vl-72b-instruct",
    "cohere/command-r-plus-08-2024",
    "cohere/command-r-08-2024",
    "mythic/mythomax-13b"
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
    const response = await fetch("https://openrouter.ai/api/v1/models")

    if (!response.ok) {
      throw new Error(`OpenRouter server is not responding.`)
    }

    const { data } = await response.json()

    let SUPPORTED_OPENROUTER_MODELS = parseSupportedModelsFromEnv()

    const openRouterModels = data
      .filter((model: any) => SUPPORTED_OPENROUTER_MODELS.includes(model.id))
      .map((model: any): OpenRouterLLM => {
        const knownModel = OPENROUTER_LLM_LIST.find(m => m.modelId === model.id)

        // Added logging for debugging
        console.log(`Processing model ID: ${model.id}`)
        console.log(
          `Found known model: ${knownModel ? knownModel.modelName : "None"}`
        )

        const { modelName } = parseOpenRouterModelName(model.id)
        return {
          modelId: model.id as LLMID,
          modelName: modelName || model.name,
          provider: "openrouter",
          hostedId: model.id,
          platformLink: "https://openrouter.dev",
          imageInput: knownModel?.imageInput ?? false,
          maxContext: model.context_length,
          description: model.description,
          pricing: {
            currency: "USD",
            inputCost: parseFloat(model.pricing?.prompt || "0") * 1000000,
            outputCost: parseFloat(model.pricing?.completion || "0") * 1000000,
            unit: "1M tokens"
          },
          tools: knownModel?.tools ?? false,
          supportsStreaming: true,
          new: knownModel?.new ?? false,
          tier: knownModel?.tier ?? "free", // Assign default tier if undefined
          categories: knownModel?.categories
        }
      })

    return openRouterModels
  } catch (error) {
    console.error("Error fetching Open Router models: " + error)
    toast.error("Error fetching Open Router models: " + error)
    return [] // Return an empty array in case of error
  }
}
