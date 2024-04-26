import OpenAI from "openai"
import { experimental_StreamData } from "ai"
import ChatCompletionMessage = OpenAI.Chat.ChatCompletionMessage

export interface FunctionCaller {
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
