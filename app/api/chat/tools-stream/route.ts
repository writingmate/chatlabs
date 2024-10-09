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
import { logger } from "@/lib/logger"

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

function getClient(model: string, profile: Tables<"profiles">) {
  const provider = LLM_LIST.find(llm => llm.modelId === model)?.provider
  logger.debug({ model, provider }, "Getting client for provider")

  if (provider === "openai") {
    checkApiKey(profile.openai_api_key, "OpenAI")
    logger.debug("Creating OpenAI client")
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
      organization: process.env.OPENAI_ORGANIZATION_ID
    })
  }

  if (provider === "mistral") {
    checkApiKey(profile.mistral_api_key, "Mistral")
    logger.debug("Creating Mistral client")
    return new OpenAI({
      apiKey: profile.mistral_api_key || "",
      baseURL: "https://api.mistral.ai/v1"
    })
  }

  if (provider === "groq") {
    checkApiKey(profile.groq_api_key, "Groq")
    logger.debug("Creating Groq client")
    return new OpenAI({
      apiKey: profile.groq_api_key || "",
      baseURL: "https://api.groq.com/openai/v1"
    })
  }

  if (provider === "openrouter") {
    checkApiKey(profile.openrouter_api_key, "OpenRouter")
    logger.debug("Creating OpenRouter client")
    return new OpenAI({
      apiKey: profile.openrouter_api_key || "",
      baseURL: "https://openrouter.ai/api/v1"
    })
  }

  logger.error({ provider }, "Unsupported provider")
  throw new Error(`Provider not supported: ${provider}`)
}

async function* fixGroqStream(response: AsyncIterable<any>) {
  logger.debug("Starting Groq stream fix")
  for await (let chunk of response) {
    logger.debug({ chunk }, "Processing Groq stream chunk")

    if (
      chunk.choices?.[0]?.delta?.tool_calls?.[0]?.function.name &&
      chunk.choices?.[0]?.delta?.tool_calls?.[0]?.function?.arguments
    ) {
      const toolCalls = chunk.choices?.[0]?.delta?.tool_calls
      try {
        logger.debug({ toolCalls }, "Fixing tool calls in Groq stream")
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
        logger.error({ error: e }, "Error fixing Groq stream")
      }
    }
    yield chunk
  }
  logger.debug("Finished Groq stream fix")
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

    const client = getClient(chatSettings.model, profile)
    logger.debug("Created client")

    const { schemaDetails, allTools } = await buildSchemaDetails(selectedTools)
    logger.debug({ toolCount: allTools.length }, "Built schema details")

    const response = await client.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages,
      tools: allTools,
      tool_choice: "auto",
      stream: true
    })
    logger.debug("Initiated chat completion stream")

    const functionCallStartTime = new Date().getTime()

    const onToolCallCallback: OpenAIStreamCallbacks["experimental_onToolCall"] =
      async (toolCallPayload, appendToolCallMessage) => {
        logger.debug({ toolCallPayload }, "Tool call initiated")
        try {
          const toolResponses = await Promise.all(
            toolCallPayload.tools.map(async toolCall => {
              let functionResponse, resultProcessingMode

              try {
                ;({ result: functionResponse, resultProcessingMode } =
                  await executeTool(schemaDetails, toolCall.func))
                logger.debug(
                  { functionName: toolCall.func.name, resultProcessingMode },
                  "Tool executed successfully"
                )
              } catch (error: any) {
                functionResponse = error.message
                logger.error(
                  { functionName: toolCall.func.name, error: error.message },
                  "Error executing tool"
                )
              }

              streamData.appendMessageAnnotation({
                [`${toolCall.func.name}`]: {
                  result: functionResponse,
                  skipTokenCount: resultProcessingMode === "render_markdown",
                  requestTime: new Date().getTime() - functionCallStartTime
                }
              })

              return {
                tool_call_id: toolCall.id,
                function_name: toolCall.func.name,
                content:
                  typeof functionResponse === "string"
                    ? functionResponse
                    : JSON.stringify(functionResponse),
                resultProcessingMode
              }
            })
          )

          logger.debug(
            { messageCount: toolResponses.length },
            "Created tool response messages"
          )

          // Append all tool response messages
          toolResponses.forEach(response => {
            logger.debug({ response }, "Appending tool response message")
            appendToolCallMessage({
              tool_call_id: response.tool_call_id,
              function_name: response.function_name,
              tool_call_result: response.content
            })
          })

          if (
            toolResponses.some(
              response => response.resultProcessingMode === "render_markdown"
            )
          ) {
            logger.debug("Returning markdown result")
            return toolResponses
              .filter(
                response => response.resultProcessingMode === "render_markdown"
              )
              ?.map(response => response.content)
              .join("\n\n")
          }

          // Create a new completion with the updated messages
          const updatedMessages = [
            ...messages,
            {
              role: "assistant",
              content: null,
              tool_calls: toolCallPayload.tools.map(tool => ({
                id: tool.id,
                type: "function",
                function: {
                  name: tool.func.name,
                  arguments: tool.func.arguments
                }
              }))
            },
            ...toolResponses.map(response => ({
              role: "tool",
              content: response.content,
              tool_call_id: response.tool_call_id
            }))
          ]
          logger.debug(
            { messageCount: updatedMessages.length },
            "Creating new completion with updated messages"
          )

          return client.chat.completions.create({
            model:
              chatSettings.model as ChatCompletionCreateParamsBase["model"],
            messages: updatedMessages,
            tools: allTools,
            stream: true
          })
        } catch (error: any) {
          logger.error({ error: error.message }, "Error in tool call callback")
          return error.message || "An unexpected error occurred"
        }
      }

    let stream = OpenAIStream(fixGroqStream(response), {
      experimental_onToolCall: onToolCallCallback,
      experimental_streamData: true,
      onFinal(completion) {
        logger.debug({ completion }, "Stream completed")
        streamData.close()
      }
    })

    logger.debug("Returning streaming response")
    return new StreamingTextResponse(stream, {}, streamData)
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
