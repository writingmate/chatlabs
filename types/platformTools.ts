import { UUID } from "crypto"
import { JSONSchema } from "openai/lib/jsonschema.mjs"

export interface ToolFunction {
  id: string
  toolFunction: Function
  description: string
  // a parameter that tells whether to send the results of the tool back to LLM or return as is to the client
  resultProcessingMode?: "send_to_llm" | "render_markdown" | "render_html"
  parameters: Parameter[]
  responseSchema?: JSONSchema
}

export interface Parameter {
  name: string
  description: string
  required: boolean
  schema: Schema
}

export interface Schema {
  type: string
  enum?: Array<string>
}

export interface PlatformTool {
  id: string
  toolName: string
  name: string
  version: string
  description: string
  systemMessage?: string
  toolsFunctions: ToolFunction[]
}

export interface ToolResultBase {
  responseTime: string
  skipTokenCount?: boolean
}

export interface ToolsCallResult extends ToolResultBase {
  toolName: string
  responseTime: string
}

export interface ImageGeneratorResult extends ToolResultBase {
  url: string
  prompt: string
  size: "1024x1024" | "1792x1024" | "1024x1792"
}
export interface GetYoutubeCaptionsResult extends ToolResultBase {
  subtitles: {
    start: string | number
    dur: string | number
    text: string
  }[]
  imageUrl: string
  videoUrl: string
}

interface KnowledgeGraph {
  title: string
  type: string
  website: string
  imageUrl: string
  description: string
  descriptionSource: string
  descriptionLink: string
  attributes: {
    Headquarters: string
    CEO: string
    Founded: string
    Sales: string
    Products: string
    Founders: string
    Subsidiaries: string
  }
}

interface OrganicResult {
  title: string
  link: string
  snippet: string
  sitelinks?: { title: string; link: string }[]
  position?: number
  attributes?: Record<string, string>
  date?: string
}

interface PeopleAlsoAsk {
  question: string
  snippet: string
  title: string
  link: string
}

interface RelatedSearches {
  query: string
}

export interface GoogleSearchResult extends ToolResultBase {
  searchParameters: {
    q: string
    gl: string
    hl: string
    autocorrect: string
    page: number
    type: string
  }
  knowledgeGraph?: KnowledgeGraph
  organic: OrganicResult[]
  peopleAlsoAsk?: PeopleAlsoAsk[]
  relatedSearches?: RelatedSearches[]
}

export interface WebScraperResult {
  url: string
}

// New plugin
export interface SearchResult {
  score: number
  title: string
  id: string
  url: string
  publishedDate: string
  author: string | null
}

export interface ExaSearchResponse {
  autopromptString: string
  results: SearchResult[]
  requestId: string
}
