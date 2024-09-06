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

  if (provider === "groq") {
    checkApiKey(profile.groq_api_key, "Groq")
    return new OpenAI({
      apiKey: profile.groq_api_key || "",
      baseURL: "https://api.groq.com/openai/v1"
    })
  }

  if (provider === "openrouter") {
    checkApiKey(profile.openrouter_api_key, "OpenRouter")
    return new OpenAI({
      apiKey: profile.openrouter_api_key || "",
      baseURL: "https://openrouter.ai/api/v1"
    })
  }

  throw new Error(`Provider not supported: ${provider}`)
}

async function* fixGroqStream(response: AsyncIterable<any>) {
  for await (let chunk of response) {
    // Assuming chunk is an object and we need to extract text from it

    if (
      chunk.choices?.[0]?.delta?.tool_calls?.[0]?.function.name &&
      chunk.choices?.[0]?.delta?.tool_calls?.[0]?.function?.arguments
    ) {
      const toolCalls = chunk.choices?.[0]?.delta?.tool_calls
      try {
        const newChunk = {
          id: chunk.id,
          object: chunk.object,
          created: chunk.created,
          model: chunk.model,
          choices: [
            {
              delta: {
                content: null,
                index: 0,
                role: "assistant",
                tool_calls: toolCalls.map((toolCall: any) => ({
                  ...toolCall,
                  function: {
                    name: toolCall.function.name,
                    arguments: ""
                  }
                })),
                finish_reason: null
              }
            }
          ]
        }

        yield newChunk

        const newChunk2 = {
          id: chunk.id,
          object: chunk.object,
          created: chunk.created,
          model: chunk.model,
          choices: [
            {
              delta: {
                index: 0,
                tool_calls: toolCalls.map((toolCall: any) => ({
                  ...toolCall,
                  function: {
                    arguments: toolCall.function.arguments
                  }
                }))
              },
              finish_reason: null
            }
          ]
        }

        yield newChunk2

        continue
      } catch (e) {
        console.error(e)
      }
    }
    yield chunk
  }
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

    const onToolCallCallback: OpenAIStreamCallbacks["experimental_onToolCall"] =
      async (toolCallPayload, appendToolCallMessage) => {
        try {
          for (const toolCall of toolCallPayload.tools) {
            let functionResponse, resultProcessingMode

            try {
              ;({ result: functionResponse, resultProcessingMode } =
                await executeTool(schemaDetails, toolCall.func))
            } catch (error: any) {
              functionResponse = error.message
            }

            streamData.appendMessageAnnotation({
              [`${toolCall.func.name}`]: {
                result: functionResponse,
                skipTokenCount: resultProcessingMode === "render_markdown",
                requestTime: new Date().getTime() - functionCallStartTime
              }
            })

            if (resultProcessingMode === "render_markdown") {
              return functionResponse
            }

            const newMessages = appendToolCallMessage({
              tool_call_id: toolCall.id,
              tool_call_result: functionResponse,
              function_name: toolCall.func.name
            })

            return client.chat.completions.create({
              model:
                chatSettings.model as ChatCompletionCreateParamsBase["model"],
              messages: [...messages, ...newMessages],
              tools: allTools,
              stream: true
            })
          }
        } catch (error: any) {
          return error.message || "An unexpected error occurred"
        }
      }

    let stream = OpenAIStream(fixGroqStream(response), {
      experimental_onToolCall: onToolCallCallback,
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
