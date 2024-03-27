import OpenAI from "openai"
import {
  AnthropicStream,
  experimental_StreamData,
  OpenAIStream,
  StreamingTextResponse
} from "ai"
import Anthropic from "@anthropic-ai/sdk"
import ChatCompletionMessage = OpenAI.Chat.Completions.ChatCompletionMessage
import { Parameter, Parameter as OpenAIParameter } from "@/types/platformTools"

interface FunctionCaller {
  findFunctionCalls: (params: {
    model: string
    messages: any[]
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[]
  }) => Promise<ChatCompletionMessage>
  createResponseStream: (params: {
    model: string
    messages: any[]
    tools: OpenAI.Chat.Completions.ChatCompletionTool[]
    streamData: experimental_StreamData
  }) => Promise<ReadableStream>
}

export class OpenAIFunctionCaller implements FunctionCaller {
  constructor(private readonly client: OpenAI) {
    this.client = client
  }

  async findFunctionCalls({
    model,
    messages,
    tools
  }: {
    model: string
    messages: any[]
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[]
  }) {
    const response = await this.client.chat.completions.create({
      model: model,
      messages: messages,
      tools: tools
    })

    return response.choices[0].message
  }

  async createResponseStream({
    model,
    messages,
    tools,
    streamData
  }: {
    model: string
    messages: any[]
    tools: OpenAI.Chat.Completions.ChatCompletionTool[]
    streamData: experimental_StreamData
  }) {
    const response = await this.client.chat.completions.create({
      model: model,
      messages,
      stream: true
    })

    return OpenAIStream(response, {
      onFinal(completion) {
        streamData.close()
      },
      experimental_streamData: true
    })
  }
}

export class AnthropicFunctionCaller implements FunctionCaller {
  constructor(private readonly client: Anthropic) {
    this.client = client
  }

  async findFunctionCalls({
    model,
    messages,
    tools
  }: {
    model: string
    messages: any[]
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[]
  }): Promise<ChatCompletionMessage> {
    const toolsPrompts = (tools ?? []).map(x => {
      return this.constructFormatToolForClaudePrompt(
        x.function.name,
        x.function.description ?? "",
        x.function.parameters as unknown as OpenAIParameter[]
      )
    })
    const existingSystemPrompt =
      messages.filter(x => x.role === "system")[0]?.content ?? ""
    const systemPrompt = this.constructToolUseSystemPrompt(toolsPrompts)
    const response = await this.client.messages.create({
      model: model,
      messages: messages.filter(x => x.role !== "system"),
      system: existingSystemPrompt + "\n\n" + systemPrompt,
      max_tokens: 4096,
      stop_sequences: ["\n\nHuman:", "\n\nAssistant", "</function_calls>"]
    })

    const functionCallingMessageContent = response.content[0].text

    // Extract parameters from the function calling message
    const toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = (
      tools ?? []
    )
      .map(tool => {
        const functionCallRegex = new RegExp(
          `<tool_name>${tool.function.name}</tool_name>\n<parameters>(.*?)</parameters>\n</invoke>`,
          "s"
        )
        const match = functionCallRegex.exec(functionCallingMessageContent)

        if (!match) {
          return null
        }

        return {
          type: "function" as "function",
          id: "",
          function: {
            name: tool.function.name,
            arguments: this.parseParameters(
              match[0],
              tool.function.parameters as unknown
            ) as any
          }
        }
      })
      .flatMap(x => (!!x ? [x] : []))

    return {
      role: "assistant",
      content: functionCallingMessageContent,
      tool_calls: toolCalls
    }
  }

  async createResponseStream({
    model,
    messages,
    streamData
  }: {
    model: string
    messages: any[]
    tools: OpenAI.Chat.Completions.ChatCompletionTool[]
    streamData: experimental_StreamData
  }) {
    const existingSystemPrompt =
      messages.filter(x => x.role === "system")[0]?.content ?? ""
    const toolMessages = messages.filter(x => x.role == "tool")
    const assistantMessage = messages[messages.length - 1]
    const functionResults =
      this.constructSuccessfulFunctionRunInjectionPrompt(toolMessages)

    const response = await this.client.messages.create({
      model: model,
      system: existingSystemPrompt,
      messages: [
        ...messages
          .filter(x => x.role !== "system" && x.role !== "tool")
          .slice(0, -1),
        {
          role: "assistant",
          content: assistantMessage.content
        },
        {
          role: "user",
          content: functionResults
        }
      ],
      stream: true,
      max_tokens: 4096,
      stop_sequences: ["\n\nHuman:", "\n\nAssistant", "</function_calls>"]
    })

    return AnthropicStream(response, {
      onFinal(completion) {
        streamData.close()
      },
      experimental_streamData: true
    })
  }

  constructFormatToolForClaudePrompt(
    name: string,
    description: string,
    parameters: Parameter[]
  ): string {
    return `
    <tool_description>
    <tool_name>${name}</tool_name>
    <description>
    ${description}
    </description>
    <parameters>
    ${this.constructFormatParametersPrompt(parameters)}
    </parameters>
    </tool_description>
  `
  }

  constructFormatParametersPrompt(parameters: any): string {
    return Object.entries(parameters.properties.parameters.properties)
      .map(
        ([parameterName, parameter]: [string, any]) => `
        <parameter>
        <name>${parameterName}</name>
        <type>${parameter.type}</type>
        <description>${parameter.description ?? ""}</description>
        </parameter>
      `
      )
      .join("\n")
  }

  constructToolUseSystemPrompt(tools: string[]): string {
    return `
    In this environment you have access to a set of tools you can use to answer the user's question.
    
    When giving the final answer to the user do not use any xml tags. 

    You may call them like this:
    <function_calls>
    <invoke>
    <tool_name>$TOOL_NAME</tool_name>
    <parameters>
    <$PARAMETER_NAME>$PARAMETER_VALUE</$PARAMETER_NAME>
    ...
    </parameters>
    </invoke>
    </function_calls>

    Here are the tools available:
    <tools>
    ${tools.join("\n")}
    </tools>
  `
  }

  constructSuccessfulFunctionRunInjectionPrompt(
    toolMessages: (OpenAI.Chat.ChatCompletionToolMessageParam & {
      name: string
    })[]
  ): string {
    return `
    <function_results>
    ${toolMessages
      .map(
        res => `
          <result>
          <tool_name>${res.name}</tool_name>
          <stdout>
          ${JSON.stringify(res.content)}
          </stdout>
          </result>
        `
      )
      .join("\n")}
    </function_results>
  `
  }

  parseParameters(functionCallingMessage: string, parameters: any): any {
    const result: { [key: string]: any } = {}
    Object.entries(parameters.properties.parameters.properties).forEach(
      ([name, schema]: [string, any]) => {
        const regex = new RegExp(`<${name}>(.*)</${name}>`, "gs")
        const match = regex.exec(functionCallingMessage)
        if (match) {
          if (schema.type === "int") {
            result[name] = parseInt(match[1])
          } else if (schema.type === "str") {
            result[name] = match[1]
          }
          if (schema.type === "float") {
            result[name] = parseFloat(match[1])
          }
          result[name] = match[1]
        }
      }
    )
    return {
      parameters: result
    }
  }
}
