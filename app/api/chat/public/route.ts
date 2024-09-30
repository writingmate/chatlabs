import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, response_format } = json as {
    chatSettings: ChatSettings
    messages: any[]
    response_format: any
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
      baseURL: process.env.OPENAI_BASE_URL || undefined
    })

    const supportsStreaming = LLM_LIST.find(model =>
      [model.modelId, model.hostedId].includes(chatSettings.model)
    )?.supportsStreaming

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      // temperature: chatSettings.temperature,
      // max_tokens: 16384, // 16k tokens,
      response_format: response_format as any,
      stream: supportsStreaming || false
    })

    if (!supportsStreaming) {
      return new Response((response as any).choices[0].message.content || "")
    }

    const stream = OpenAIStream(response as any)

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
