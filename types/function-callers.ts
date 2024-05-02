import OpenAI from "openai"
import {
  CreateMessage,
  experimental_StreamData,
  FunctionCallPayload,
  JSONValue
} from "ai"
import ChatCompletionMessage = OpenAI.Chat.ChatCompletionMessage

export interface FindFunctionCallsStreamParams {
  model: string
  messages: any[]
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[]
  onFunctionCall: (
    functionCallPayload: FunctionCallPayload,
    createFunctionCallMessages: (
      functionCallResult: JSONValue
    ) => CreateMessage[]
  ) => any
}

export interface FindFunctionCallsParams {
  model: string
  messages: any[]
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[]
}

export interface CreateResponseStreamParams {
  model: string
  messages: any[]
  tools: OpenAI.Chat.Completions.ChatCompletionTool[]
  streamData: experimental_StreamData
}

export interface FunctionCaller {
  findFunctionCallsStream: (
    params: FindFunctionCallsStreamParams
  ) => Promise<ReadableStream>
  findFunctionCalls: (
    params: FindFunctionCallsParams
  ) => Promise<ChatCompletionMessage>
  createResponseStream: (
    params: CreateResponseStreamParams
  ) => Promise<ReadableStream>
}
