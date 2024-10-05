import { platformToolDefinitions } from "@/lib/platformTools/utils/platformToolsUtils"
import {
  checkApiKey,
  getServerProfile,
  validateModelAndMessageCount
} from "@/lib/server/server-chat-helpers"
import { Tables } from "@/supabase/types"
import { ChatSettings } from "@/types"
import {
  experimental_StreamData,
  OpenAIStream,
  StreamingTextResponse,
  OpenAIStreamCallbacks
} from "ai"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import {
  buildSchemaDetails,
  executeTool,
  prependSystemPrompt
} from "@/lib/tools/utils"
import { logger } from "@/lib/logger"
import {
  AnthropicFunctionCaller,
  GroqFunctionCaller,
  OpenAIFunctionCaller
} from "@/lib/tools/function-callers"
import Anthropic from "@anthropic-ai/sdk"
import { createOpenAI } from "@ai-sdk/openai"
import { createMistral } from "@ai-sdk/mistral"
import { createAnthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"
export const maxDuration = 300

export async function GET() {
  logger.debug("GET request received for tool definitions")
  const definitions = platformToolDefinitions()
  logger.debug(
    { definitionCount: Object.keys(definitions).length },
    "Returning tool definitions"
  )
  return new Response(JSON.stringify(definitions), {
    headers: {
      "Content-Type": "application/json"
    }
  })
}

function getProvider(model: string, profile: Tables<"profiles">) {
  const provider = LLM_LIST.find(
    llm => llm.modelId === model || llm.hostedId === model
  )?.provider
  logger.debug({ model, provider }, "Getting provider caller")

  if (provider === "openai") {
    checkApiKey(profile.openai_api_key, "OpenAI")
    logger.debug("Creating OpenAI function caller")
    return createOpenAI({
      apiKey: profile.openai_api_key || "",
      baseURL: process.env.OPENAI_BASE_URL || undefined
    })
  }

  if (provider === "mistral") {
    checkApiKey(profile.mistral_api_key, "Mistral")
    logger.debug("Creating Mistral function caller")
    return createMistral({
      apiKey: profile.mistral_api_key || "",
      baseURL: "https://api.mistral.ai/v1"
    })
  }

  if (provider === "anthropic") {
    checkApiKey(profile.anthropic_api_key, "Anthropic")
    logger.debug("Creating Anthropic function caller")
    return createAnthropic({
      apiKey: profile.anthropic_api_key || "",
      baseURL: process.env.ANTHROPIC_BASE_URL || undefined
    })
  }

  if (provider === "groq") {
    checkApiKey(profile.groq_api_key, "Groq")
    logger.debug("Creating Groq function caller")
    return createOpenAI({
      apiKey: profile.groq_api_key || "",
      baseURL: "https://api.groq.com/openai/v1"
    })
  }

  logger.error({ provider }, "Unsupported provider")
  throw new Error(`Provider not supported: ${provider}`)
}

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, selectedTools } = json as {
    chatSettings: ChatSettings
    messages: any[]
    selectedTools: Tables<"tools">[]
  }

  logger.debug(
    {
      chatSettings,
      messageCount: messages.length,
      selectedToolsCount: selectedTools.length
    },
    "Received POST request"
  )

  prependSystemPrompt(messages)
  logger.debug("System prompt prepended to messages")

  const streamData = new experimental_StreamData()

  try {
    const profile = await getServerProfile()
    logger.debug("Got server profile")

    await validateModelAndMessageCount(chatSettings.model, new Date())
    logger.debug("Validated model and message count")

    const functionCallStartTime = new Date().getTime()

    const client = getProvider(chatSettings.model, profile)
    logger.debug("Created provider caller")

    const { schemaDetails, allTools } = await buildSchemaDetails(selectedTools)
    logger.debug({ toolCount: allTools.length }, "Built schema details")

    return generateText({
      model: client(chatSettings.model),
      messages: messages.splice(1),
      prompt: messages[messages.length - 1].content,
      tools: allTools
    })
  } catch (error: any) {
    logger.error({ error }, "Error in POST handler")
    const errorMessage = error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    logger.error("Returning error response", { errorMessage, errorCode })
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
