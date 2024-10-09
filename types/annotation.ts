import {
  GetYoutubeCaptionsResult,
  GoogleSearchResult,
  ImageGeneratorResult,
  ToolResultBase,
  ToolsCallResult,
  WebScraperResult
} from "@/types/platformTools"
import { MessageHtmlElement } from "./html"

export type Annotation = {
  imageGenerator__generateImage?: ImageGeneratorResult
  webScraper__youtubeCaptions?: GetYoutubeCaptionsResult
  webScraper__googleSearch?: GoogleSearchResult
  webScraper__webScraper?: WebScraperResult
  toolCalls?: ToolsCallResult
  selected_html_elements?: MessageHtmlElement[]
}

interface ToolResult<T> extends ToolResultBase {
  result: T
}
export type Annotation2 = {
  imageGenerator__generateImage?: ToolResult<ImageGeneratorResult>
  webScraper__youtubeCaptions?: ToolResult<GetYoutubeCaptionsResult>
  webScraper__googleSearch?: ToolResult<GoogleSearchResult>
  webScraper__webScraper?: ToolResult<WebScraperResult>
  toolCalls?: ToolResult<ToolsCallResult>
}
