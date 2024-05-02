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
  AnthropicStream,
  experimental_StreamData,
  OpenAIStream,
  StreamingTextResponse
} from "ai"
import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import {
  AnthropicFunctionCaller,
  GroqFunctionCaller,
  OpenAIFunctionCaller
} from "@/lib/tools/function-callers"

export const maxDuration = 300

export async function GET() {
  return new Response(JSON.stringify(platformToolDefinitions()), {
    headers: {
      "Content-Type": "application/json"
    }
  })
}

function getProviderCaller(model: string, profile: Tables<"profiles">) {
  const provider = LLM_LIST.find(llm => llm.modelId === model)?.provider
  if (provider === "openai") {
    checkApiKey(profile.openai_api_key, "OpenAI")

    return new OpenAIFunctionCaller(
      new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "",
        organization: process.env.OPENAI_ORGANIZATION_ID
      })
    )
  }

  if (provider === "mistral") {
    checkApiKey(profile.mistral_api_key, "Mistral")
    return new OpenAIFunctionCaller(
      new OpenAI({
        apiKey: profile.mistral_api_key || "",
        baseURL: "https://api.mistral.ai/v1"
      })
    )
  }

  if (provider === "anthropic") {
    checkApiKey(profile.anthropic_api_key, "Anthropic")
    return new AnthropicFunctionCaller(
      new Anthropic({
        apiKey: profile.anthropic_api_key || "",
        baseURL: "https://api.anthropic.com"
      })
    )
  }

  if (provider === "groq") {
    checkApiKey(profile.groq_api_key, "Groq")
    return new GroqFunctionCaller(
      new OpenAI({
        apiKey: profile.groq_api_key || "",
        baseURL: "https://api.groq.com/openai/v1"
      })
    )
  }

  throw new Error(`Provider not supported: ${provider}`)
}

const SYSTEM_PROMPT = `
Today is ${new Date().toLocaleDateString()}.

You are an expert in composing functions. You are given a question and a set of possible functions. 
Based on the question, you will need to make one or more function/tool calls to achieve the purpose. 
You should only return the function call in tools call sections.

Always break down youtube captions in to three sentence paragraphs and add links to time codes like this:
<paragraph1>[1](https://youtube.com/watch?v=VIDEO_ID&t=START1s).
<paragraph2>[2](https://youtube.com/watch?v=VIDEO_ID&t=START2s).
<paragraph3>[3](https://youtube.com/watch?v=VIDEO_ID&t=START3s).

Always add references for google search results at the end of each sentence like this:
<sentence1>[1](<link1>).
<sentence2>[2](<link2>).

Each unique link has unique reference number.

Never include image url in the response for generated images. Do not say you can't display image. 
Do not use semi-colons when describing the image. Never use html, always use Markdown.
`

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, selectedTools } = json as {
    chatSettings: ChatSettings
    messages: any[]
    selectedTools: Tables<"tools">[]
  }

  if (messages[0].role == "system") {
    messages[0].content += SYSTEM_PROMPT
  } else {
    messages.unshift({
      role: "system",
      content: SYSTEM_PROMPT
    })
  }

  const streamData = new experimental_StreamData()

  try {
    const profile = await getServerProfile()

    await validateModelAndMessageCount(chatSettings.model, new Date())

    const functionCallStartTime = new Date().getTime()

    const client = getProviderCaller(chatSettings.model, profile)

    let allTools: OpenAI.Chat.Completions.ChatCompletionTool[] = []
    let allRouteMaps = {}
    let schemaDetails = []

    for (const selectedTool of selectedTools) {
      try {
        const convertedSchema = await openapiToFunctions(
          JSON.parse(selectedTool.schema as string)
        )
        const tools = convertedSchema.functions || []
        allTools = allTools.concat(tools)

        const routeMap = convertedSchema.routes.reduce(
          (map: Record<string, string>, route) => {
            map[route.path.replace(/{(\w+)}/g, ":$1")] = route.operationId
            return map
          },
          {}
        )

        allRouteMaps = { ...allRouteMaps, ...routeMap }

        const requestInBodyMap = convertedSchema.routes.reduce(
          (previousValue: { [key: string]: boolean }, currentValue) => {
            previousValue[currentValue.path] = !!currentValue.requestInBody
            return previousValue
          },
          {}
        )

        schemaDetails.push({
          title: convertedSchema.info.title,
          description: convertedSchema.info.description,
          url: convertedSchema.info.server,
          headers: selectedTool.custom_headers,
          routeMap,
          requestInBodyMap
        })
      } catch (error: any) {
        console.error("Error converting schema", error)
      }
    }

    const message = await client.findFunctionCalls({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages,
      tools: allTools.length > 0 ? allTools : undefined
    })

    streamData.appendMessageAnnotation({
      toolCalls: {
        responseTime: new Date().getTime() - functionCallStartTime + ""
      }
    })

    messages.push(message)
    const toolCalls = message.tool_calls || []

    if (toolCalls.length === 0) {
      return new Response(`0:${JSON.stringify(message.content)}\n`, {
        headers: {
          "Content-Type": "application/json"
        }
      })
    }

    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const functionCall = toolCall.function
        const functionName = functionCall.name

        let parsedArgs = functionCall.arguments as any
        if (typeof functionCall.arguments === "string") {
          parsedArgs = JSON.parse(functionCall.arguments.trim())
        }

        // Find the schema detail that contains the function name
        const schemaDetail = schemaDetails.find(detail =>
          Object.values(detail.routeMap).includes(functionName)
        )

        if (!schemaDetail) {
          throw new Error(`Function ${functionName} not found in any schema`)
        }

        const functionCallStartTime = new Date().getTime()
        // Reroute to local executor for local tools
        if (schemaDetail.url === "local://executor") {
          const toolFunction = platformToolFunction(functionName)
          if (!toolFunction) {
            throw new Error(`Function ${functionName} not found`)
          }

          const data = await toolFunction(parsedArgs)

          streamData.appendMessageAnnotation({
            [`${functionName}`]: {
              ...data,
              responseTime: new Date().getTime() - functionCallStartTime
            }
          })

          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: JSON.stringify(data)
          })

          continue
        }

        const pathTemplate = Object.keys(schemaDetail.routeMap).find(
          key => schemaDetail.routeMap[key] === functionName
        )

        if (!pathTemplate) {
          throw new Error(`Path for function ${functionName} not found`)
        }

        const path = pathTemplate.replace(/:(\w+)/g, (_, paramName) => {
          const value = parsedArgs.parameters[paramName]
          if (!value) {
            throw new Error(
              `Parameter ${paramName} not found for function ${functionName}`
            )
          }
          return encodeURIComponent(value)
        })

        if (!path) {
          throw new Error(`Path for function ${functionName} not found`)
        }

        // Determine if the request should be in the body or as a query
        const isRequestInBody = schemaDetail.requestInBodyMap[path]
        let data = {}

        if (isRequestInBody) {
          // If the type is set to body
          let headers = {
            "Content-Type": "application/json"
          }

          // Check if custom headers are set
          const customHeaders = schemaDetail.headers // Moved this line up to the loop
          // Check if custom headers are set and are of type string
          if (customHeaders && typeof customHeaders === "string") {
            let parsedCustomHeaders = JSON.parse(customHeaders) as Record<
              string,
              string
            >

            headers = {
              ...headers,
              ...parsedCustomHeaders
            }
          }

          const fullUrl = schemaDetail.url + path

          const bodyContent = parsedArgs.requestBody || parsedArgs

          const requestInit = {
            method: "POST",
            headers,
            body: JSON.stringify(bodyContent) // Use the extracted requestBody or the entire parsedArgs
          }

          const response = await fetch(fullUrl, requestInit)

          if (!response.ok) {
            data = {
              error: response.statusText
            }
          } else {
            data = await response.json()
          }
        } else {
          // If the type is set to query
          const queryParams = new URLSearchParams(
            parsedArgs.parameters
          ).toString()
          const fullUrl =
            schemaDetail.url + path + (queryParams ? "?" + queryParams : "")

          let headers = {}

          // Check if custom headers are set
          const customHeaders = schemaDetail.headers
          if (customHeaders && typeof customHeaders === "string") {
            headers = JSON.parse(customHeaders)
          }

          const response = await fetch(fullUrl, {
            method: "GET",
            headers: headers
          })

          if (!response.ok) {
            console.error("Error:", response.statusText, response.status)
            data = {
              error: response.statusText
            }
          } else {
            data = await response.json()
          }
        }

        streamData.appendMessageAnnotation({
          functionName: data
        })

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(data)
        })
      }
    }

    const stream = await client.createResponseStream({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages,
      tools: allTools,
      streamData
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
