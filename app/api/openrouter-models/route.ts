import { NextResponse } from "next/server"
import { LLM, LLMID, ModelProvider, OpenRouterLLM } from "@/types"
import { CATEGORIES } from "@/lib/models/categories"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { logger } from "@/lib/logger"

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
    provider: "gryphe" as ModelProvider,
    modelName: "Mythomax 13B",
    categories: [CATEGORIES.ROLEPLAY]
  }
}

const PRO_TIER_PROMPT_MAX = 10
const PRO_TIER_COMPLETION_MAX = 15
const ULTIMATE_TIER_PROMPT_MAX = Infinity
const ULTIMATE_TIER_COMPLETION_MAX = Infinity

function getTier(pricing: { prompt: string; completion: string }) {
  const promptCost = Math.max(parseFloat(pricing.prompt) * 1000000, 0)
  const completionCost = Math.max(parseFloat(pricing.completion) * 1000000, 0)

  if (promptCost === 0 && completionCost === 0) {
    return "free"
  }

  if (
    promptCost <= PRO_TIER_PROMPT_MAX &&
    completionCost <= PRO_TIER_COMPLETION_MAX
  ) {
    return "pro"
  }
  if (
    promptCost <= ULTIMATE_TIER_PROMPT_MAX &&
    completionCost <= ULTIMATE_TIER_COMPLETION_MAX
  ) {
    return "ultimate"
  }
}

function normalizeModelName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-")
}

const existingModelNames = new Set(
  LLM_LIST.map(model => normalizeModelName(model.modelName))
)

function parseOpenRouterModel({
  modelId,
  modelName,
  provider,
  isBYOKRequired,
  pricing
}: {
  modelId: string
  modelName: string
  provider?: ModelProvider
  isBYOKRequired?: boolean
  pricing?: {
    inputCost: string
    outputCost: string
  }
}): OpenRouterLLM | null {
  if (isBYOKRequired) {
    return null
  }

  const knownModel = KNOWN_MODEL_NAMES[modelId]
  const chunks = modelName.split("/")
  let modelProvider: ModelProvider | undefined = provider

  if (!modelProvider && chunks.length === 2) {
    modelProvider = chunks[0] as ModelProvider
  }

  if (!modelProvider) {
    modelProvider = "openrouter"
  }

  const parsedModelName = modelName.split(":").pop()?.trim() || modelName

  const normalizedModelName = normalizeModelName(parsedModelName)
  if (existingModelNames.has(normalizedModelName)) {
    logger.debug(
      "Skipping model as it already exists in LLM_LIST",
      normalizedModelName
    )
    return null // Skip this model as it already exists in LLM_LIST
  }

  return {
    modelId: modelId as LLMID,
    hostedId: modelId,
    provider: knownModel?.provider || modelProvider,
    modelName: knownModel?.modelName || parsedModelName,
    platformLink: "https://openrouter.dev",
    imageInput: false,
    maxContext: 0, // This will be updated later
    description: "", // This will be updated later
    pricing: {
      currency: "USD",
      inputCost: parseFloat(pricing?.inputCost || "0") * 1000000,
      outputCost: parseFloat(pricing?.outputCost || "0") * 1000000,
      unit: "1M tokens"
    },
    tier: getTier({
      prompt: (pricing?.inputCost || 0).toString(),
      completion: (pricing?.outputCost || 0).toString()
    }), // This will be updated later
    categories: knownModel?.categories || []
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
    "meta-llama/llama-3.1-405b-instruct"
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

export async function GET() {
  try {
    const response = await fetch("https://openrouter.ai/api/frontend/models", {
      headers: {
        "Content-Type": "application/json"
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(
        `OpenRouter server responded with status: ${response.status}`
      )
    }

    const { data } = await response.json()

    const openRouterModels: OpenRouterLLM[] = data
      // .filter((model: any) => supportedModels.includes(model.slug))
      .map((model: any) =>
        parseOpenRouterModel({
          modelId: model.slug,
          modelName: model.name,
          provider: "openrouter",
          isBYOKRequired: model.endpoint?.is_byok_required,
          pricing: {
            inputCost: model.endpoint?.pricing?.prompt,
            outputCost: model.endpoint?.pricing?.completion
          }
        })
      )
      .filter(
        (model: OpenRouterLLM | null): model is OpenRouterLLM => model !== null
      )
      .map((model: OpenRouterLLM) => ({
        ...model,
        maxContext: model.maxContext,
        description: model.description
      }))

    return NextResponse.json(
      { data: openRouterModels },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
        }
      }
    )
  } catch (error) {
    console.error("Error fetching Open Router models:", error)

    // Fallback to /api/v1/models
    try {
      const fallbackResponse = await fetch(
        "https://openrouter.ai/api/v1/models",
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )

      if (!fallbackResponse.ok) {
        throw new Error(
          `Fallback API responded with status: ${fallbackResponse.status}`
        )
      }

      const fallbackData = await fallbackResponse.json()

      const fallbackModels: OpenRouterLLM[] = fallbackData.data
        .map((model: any) =>
          parseOpenRouterModel({
            modelId: model.id,
            modelName: model.name,
            pricing: model.pricing
          })
        )
        .filter(
          (model: OpenRouterLLM | null): model is OpenRouterLLM =>
            model !== null
        )
        .map((model: OpenRouterLLM) => ({
          ...model,
          maxContext: model.maxContext,
          description: model.description || ""
        }))

      return NextResponse.json(
        { data: fallbackModels },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=3600, stale-while-revalidate=86400"
          }
        }
      )
    } catch (fallbackError) {
      console.error("Error fetching fallback models:", fallbackError)
      return NextResponse.json(
        { message: "Error fetching Open Router models" },
        { status: 500 }
      )
    }
  }
}
