import { ModelProvider } from "."

export type LLMID =
  | OpenAILLMID
  | GoogleLLMID
  | AnthropicLLMID
  | MistralLLMID
  | GroqLLMID
  | PerplexityLLMID

// OpenAI Models (UPDATED 1/29/24)
export type OpenAILLMID =
  | "gpt-4-turbo-preview" // GPT-4 Turbo
  | "gpt-4-vision-preview" // GPT-4 Vision
  | "gpt-4" // GPT-4
  | "gpt-3.5-turbo" // Updated GPT-3.5 Turbo
  // | "gpt-3.5-turbo-1106" // GPT-3.5
  | "gpt-3.5-turbo-0125" // GPT-3.5
  | "gpt-4-turbo" // GPT-4 Turbo
  | "gpt-4o" // GPT-4o
  | "gpt-4o-mini" // GPT-4 Vision
  | "gpt-4o-2024-08-06" // GPT-4o (updated 8/6/24)
  | "o1-mini" // O1 Mini
  | "o1-preview" // O1 Mini Latest

// Google Models
export type GoogleLLMID =
  | "gemini-pro" // Gemini Pro
  | "gemini-pro-vision" // Gemini Pro Vision
  | "gemini-1.5-pro-latest" // Gemini 1.5 Pro
  | "gemini-1.5-flash-latest" // Gemini 1.5 Latest

// Anthropic Models
export type AnthropicLLMID =
  | "claude-3-5-sonnet-20240620"
  | "claude-2.1" // Claude 2
  | "claude-instant-1.2" // Claude Instant
  | "claude-3-haiku-20240307" // Claude 3 Haiku
  | "claude-3-sonnet-20240229" // Claude 3 Sonnet
  | "claude-3-opus-20240229" // Claude 3 Opus

// Mistral Models
export type MistralLLMID =
  | "mistral-tiny" // Mistral Tiny
  | "mistral-small" // Mistral Small
  | "mistral-medium" // Mistral Medium
  | "mistral-large-latest" // Mistral Large

export type GroqLLMID =
  // | "llama2-70b-4096" // LLaMA2-70b
  | "mixtral-8x7b-32768" // Mixtral-8x7b
  | "llama3-70b-8192" // LLaMA3-70b
  | "llama3-8b-8192" // LLaMA3-8b

// Perplexity Models (UPDATED 1/31/24)

export type PerplexityLLMID =
  | "llama-3.1-sonar-small-128k-online" // Sonar Small Chat
  | "llama-3.1-sonar-large-128k-online" // Sonar Small Online
  | "llama-3.1-sonar-huge-128k-online" // Sonar Medium Chat
  | "llama-3.1-sonar-small-128k-chat" // Sonar Medium Online
  | "llama-3.1-sonar-large-128k-chat" // Sonar Large Online

// Add this new type definition
export type Category = {
  category: string
  description?: string
  color?: string
}

// Update the LLM interface to include categories
export interface LLM {
  modelId: LLMID
  modelName: string
  provider: ModelProvider
  hostedId: string
  platformLink: string
  imageInput: boolean
  tools?: boolean
  supportsStreaming?: boolean
  description?: string
  tags?: string[]
  pricing?: {
    currency: string
    unit: string
    inputCost: number
    outputCost?: number
  }
  new?: boolean
  tier?: "free" | "pro" | "ultimate" | undefined
  categories?: Category[]
}

export interface OpenRouterLLM extends LLM {
  maxContext: number
}
