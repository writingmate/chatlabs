import { ModelProvider } from "."

export type LLMID =
  | OpenAILLMID
  | GoogleLLMID
  | AnthropicLLMID
  | MistralLLMID
  | GroqLLMID
  | PerplexityLLMID
  | OpenRouterLLMID

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
  | "llama-3.1-70b-versatile" // LLaMA3.1-70b
  | "llama3-8b-8192" // LLaMA3-8b
  | "llama3-groq-70b-8192-tool-use-preview" // LLaMA3-13b

// Perplexity Models (UPDATED 1/31/24)

export type PerplexityLLMID =
  | "pplx-7b-online" // Perplexity Online 7B
  | "pplx-70b-online" // Perplexity Online 70B
  | "pplx-7b-chat" // Perplexity Chat 7B
  | "pplx-70b-chat" // Perplexity Chat 70B
  | "mixtral-8x7b-instruct" // Mixtral 8x7B Instruct
  | "mistral-7b-instruct" // Mistral 7B Instruct
  | "llama-2-70b-chat" // Llama2 70B Chat
  | "codellama-34b-instruct" // CodeLlama 34B Instruct
  | "codellama-70b-instruct" // CodeLlama 70B Instruct
  | "llama-3-sonar-small-32k-chat" // Sonar Small Chat
  | "llama-3-sonar-small-32k-online" // Sonar Small Online
  | "llama-3-sonar-large-32k-chat" // Sonar Medium Chat
  | "llama-3-sonar-large-32k-online" // Sonar Medium Online

export type OpenRouterLLMID =
  | "openai/o1-mini"
  | "openai/o1-preview"
  | "openai/gpt-4o-2024-08-06"
  | "openai/gpt-4-vision-preview"
  | "openai/gpt-4o-mini"
  | "google/gemini-pro-1.5"
  | "google/gemini-pro-vision"
  | "google/gemini-flash-1.5-exp"
  | "google/gemini-pro-1.5-exp"
  | "anthropic/claude-3-haiku"
  | "anthropic/claude-3.5-sonnet"
  | "databricks/dbrx-instruct"
  | "mistralai/mixtral-8x22b-instruct"
  | "microsoft/wizardlm-2-8x22b"
  | "meta-llama/llama-3.1-405b-instruct"
  | "liuhaotian/llava-yi-34b"
  | "fireworks/firellava-13b"
  | "perplexity/llama-3.1-sonar-huge-128k-online"
  | "mattshumer/reflection-70b"
  | "deepseek/deepseek-chat"

export interface LLM {
  modelId: LLMID
  modelName: string
  provider: ModelProvider
  hostedId: string
  platformLink: string
  imageInput: boolean
  paid?: boolean
  tools?: boolean
  supportsStreaming?: boolean
  description?: string
  pricing?: {
    currency: string
    unit: string
    inputCost: number
    outputCost?: number
  }
  new?: boolean
}

export interface OpenRouterLLM extends LLM {
  modelId: LLMID
  modelName: string
  maxContext: number
  tools: boolean
  supportsStreaming: boolean
  imageInput: boolean
  new?: boolean
}
