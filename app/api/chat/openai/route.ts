import {
  checkApiKey,
  getServerProfile,
  validateModelAndMessageCount
} from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"
import { OPENAI_LLM_LIST } from "@/lib/models/llm/openai-llm-list"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"

export const runtime: ServerRuntime = "edge"

function dropSystemMessage(messages: any[]) {
  return messages.filter((message: any) => message.role !== "system")
}

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.openai_api_key, "OpenAI")

    await validateModelAndMessageCount(chatSettings.model, new Date())

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id,
      baseURL: process.env.OPENAI_BASE_URL || undefined
    })

    const supportsVision =
      OPENAI_LLM_LIST.find(x =>
        [x.modelId, x.hostedId].includes(chatSettings.model)
      )?.imageInput || false

    const isO1 = ["o1-mini", "o1-preview"].includes(chatSettings.model)
    const cleanedMessages = isO1 ? dropSystemMessage(messages) : messages
    const temperature = isO1 ? 1 : chatSettings.temperature

    const maxTokensProperty = isO1 ? "max_completion_tokens" : "max_tokens"
    const supportsStream = isO1 ? false : true

    const response = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: cleanedMessages as ChatCompletionCreateParamsBase["messages"],
      temperature: temperature,
      [maxTokensProperty]: supportsVision
        ? CHAT_SETTING_LIMITS[chatSettings.model].MAX_TOKEN_OUTPUT_LENGTH
        : null,
      stream: supportsStream
    })

    if (!supportsStream) {
      // @ts-ignore
      return new Response(response.choices[0].message.content)
    }

    // @ts-ignore
    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "OpenAI API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "OpenAI API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
