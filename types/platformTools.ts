import { UUID } from "crypto"

export interface ToolFunction {
  id: string
  toolFunction: Function
  description: string
  parameters: Parameter[]
}

export interface Parameter {
  name: string
  description: string
  required: boolean
  schema: Schema
}

export interface Schema {
  type: string
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

interface ToolResultBase {
  responseTime: string
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
