import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import {
  checkApiKey,
  getServerProfile,
  validateModelAndMessageCount
} from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import Anthropic from "@anthropic-ai/sdk"
import { AnthropicStream, StreamingTextResponse } from "ai"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export const maxDuration = 300

function addCacheControlToUserMessages(messages: any[], limit = 2) {
  // adds cache_control to the last `limit` user messages content
  return messages.map((message, index) => {
    if (message.role === "user" && index >= messages.length - limit - 1) {
      if (typeof message.content === "string") {
        return {
          ...message,
          content: [
            {
              type: "text",
              text: message.content,
              cache_control: {
                type: "ephemeral"
              }
            }
          ]
        }
      }

      if (Array.isArray(message.content)) {
        return {
          ...message,
          content: message.content.map((y: any) => {
            if (y.type === "text") {
              return {
                type: "text",
                text: y.text,
                cache_control: {
                  type: "ephemeral"
                }
              }
            }
            return y
          })
        }
      }
    }
    return message
  })
}

export async function POST(request: NextRequest) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()
    checkApiKey(profile.anthropic_api_key, "Anthropic")
    await validateModelAndMessageCount(chatSettings.model, new Date())

    const modelsSupportingCacheControl = [
      "claude-3-opus-20240229",
      "claude-3-haiku-20240307",
      "claude-3-5-sonnet-20240715"
    ]

    let ANTHROPIC_FORMATTED_MESSAGES: any =
      modelsSupportingCacheControl.includes(chatSettings.model)
        ? addCacheControlToUserMessages(messages.slice(1))
        : messages.slice(1)

    const anthropic = new Anthropic({
      apiKey: profile.anthropic_api_key || "",
      baseURL: process.env.ANTHROPIC_BASE_URL || undefined
    })

    const response = await anthropic.messages.create(
      {
        model: chatSettings.model,
        messages: ANTHROPIC_FORMATTED_MESSAGES,
        temperature: chatSettings.temperature,
        system: [
          {
            type: "text",
            text: messages[0].content,
            // @ts-ignore
            cache_control: {
              type: "ephemeral"
            }
          }
        ],
        max_tokens:
          CHAT_SETTING_LIMITS[chatSettings.model].MAX_TOKEN_OUTPUT_LENGTH,
        stream: true
      },
      {
        headers: {
          "anthropic-version": "2023-06-01",
          "anthropic-beta":
            "prompt-caching-2024-07-31,max-tokens-3-5-sonnet-2024-07-15"
        }
      }
    )

    // @ts-ignore
    const stream = AnthropicStream(response)
    return new StreamingTextResponse(stream)
  } catch (error: any) {
    console.error("Error processing request:", error, { payload: json })
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Anthropic API Key not found. Please set it in your profile settings."
    } else if (errorCode === 401) {
      errorMessage =
        "Anthropic API Key is incorrect. Please fix it in your profile settings."
    } else if (errorCode === 403) {
      errorMessage = error.message
    }
    return new NextResponse(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
