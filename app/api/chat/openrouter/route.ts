import { ServerRuntime } from "next"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

import { logger } from "@/lib/logger"
import { createErrorResponse } from "@/lib/response"
import {
  checkApiKey,
  getServerProfile,
  validateModelAndMessageCount
} from "@/lib/server/server-chat-helpers"

export const runtime: ServerRuntime = "edge"

interface OpenRouterError extends Error {
  status?: number
  code?: string
}

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.openrouter_api_key, "OpenRouter")

    await validateModelAndMessageCount(chatSettings.model, new Date())

    const openai = new OpenAI({
      apiKey: profile.openrouter_api_key || "",
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": `https://writingmate.ai/labs`,
        "X-Title": `ChatLabs`,
        "X-Description": `Chat with all best AI models in one place`
      }
    })

    const response = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      temperature: chatSettings.temperature,
      max_tokens: undefined,
      stream: true
    })

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
  } catch (error: unknown) {
    const err = error as OpenRouterError

    logger.error(
      {
        err: err,
        model: chatSettings.model,
        statusCode: err.status
      },
      "OpenRouter API error"
    )

    // Handle specific error cases
    if (err.code === "insufficient_quota" || err.status === 429) {
      return createErrorResponse(
        "Rate limit exceeded. Please try again later.",
        429
      )
    }

    if (err.status === 401 || err.status === 403) {
      return createErrorResponse(
        "Invalid API key or unauthorized access. Please check your OpenRouter API key.",
        err.status
      )
    }

    if (err.status === 404) {
      return createErrorResponse(
        "The requested model is currently unavailable.",
        404
      )
    }

    // For network or connection errors
    if (
      err.message?.toLowerCase().includes("network") ||
      err.message?.toLowerCase().includes("connection")
    ) {
      return createErrorResponse(
        "Failed to connect to OpenRouter. Please try again.",
        503
      )
    }

    // Preserve original error status if available, otherwise use 500
    const statusCode = err.status || 500
    const message = err.message || "An unexpected error occurred"

    return createErrorResponse(message, statusCode)
  }
}
