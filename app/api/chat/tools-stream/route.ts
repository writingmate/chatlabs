import { openapiToFunctions } from "@/lib/openapi-conversion"
import {
  platformToolDefinitions,
  platformToolFunction
} from "@/lib/platformTools/utils/platformToolsUtils"
import {
  checkApiKey,
  getServerProfile,
  validateModelAndMessageCount
} from "@/lib/server/server-chat-helpers"
import { Tables } from "@/supabase/types"
import { ChatSettings } from "@/types"
import {
  experimental_StreamData,
  FunctionCallPayload,
  OpenAIStream,
  StreamingTextResponse
} from "ai"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import {
  buildSchemaDetails,
  executeTool,
  prependSystemPrompt
} from "@/lib/tools/utils"

export const maxDuration = 300

export async function GET() {
  return new Response(JSON.stringify(platformToolDefinitions()), {
    headers: {
      "Content-Type": "application/json"
    }
  })
}

function getClient(model: string, profile: Tables<"profiles">) {
  const provider = LLM_LIST.find(llm => llm.modelId === model)?.provider
  if (provider === "openai") {
    checkApiKey(profile.openai_api_key, "OpenAI")

    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
      organization: process.env.OPENAI_ORGANIZATION_ID
    })
  }

  if (provider === "mistral") {
    checkApiKey(profile.mistral_api_key, "Mistral")
    return new OpenAI({
      apiKey: profile.mistral_api_key || "",
      baseURL: "https://api.mistral.ai/v1"
    })
  }

  if (provider === undefined) {
    // special case for openrouter
    checkApiKey(profile.openrouter_api_key, "OpenRouter")
    return new OpenAI({
      apiKey: profile.openrouter_api_key || "",
      baseURL: "https://openrouter.ai/api/v1"
    })
  }

  throw new Error(`Provider not supported: ${provider}`)
}

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, selectedTools } = json as {
    chatSettings: ChatSettings
    messages: any[]
    selectedTools: Tables<"tools">[]
  }

  prependSystemPrompt(messages)

  const streamData = new experimental_StreamData()

  try {
    const profile = await getServerProfile()

    await validateModelAndMessageCount(chatSettings.model, new Date())

    const client = getClient(chatSettings.model, profile)

    const { schemaDetails, allTools } = await buildSchemaDetails(selectedTools)

    const response = await client.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages,
      tools: allTools,
      tool_choice: "auto",
      stream: true
    })

    const functionCallStartTime = new Date().getTime()

    const stream = OpenAIStream(response, {
      experimental_onToolCall: async (
        toolCallPayload,
        appendToolCallMessage
      ) => {
        for (const toolCall of toolCallPayload.tools) {
          const functionResponse = await executeTool(
            schemaDetails,
            toolCall.func
          )

          const newMessages = appendToolCallMessage({
            tool_call_id: toolCall.id,
            tool_call_result: functionResponse,
            function_name: toolCall.func.name
          })

          streamData.appendMessageAnnotation({
            [`${toolCall.func.name}`]: {
              ...functionResponse,
              requestTime: new Date().getTime() - functionCallStartTime
            }
          })

          return client.chat.completions.create({
            model:
              chatSettings.model as ChatCompletionCreateParamsBase["model"],
            messages: [...messages, ...newMessages],
            tools: allTools,
            stream: true
          })
        }
      },
      experimental_streamData: true,
      onFinal(completion) {
        streamData.close()
      }
    })

    return new StreamingTextResponse(stream, {}, streamData)
  } catch (error: any) {
    console.error(error)
    const errorMessage = error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
