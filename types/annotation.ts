import {
  GetYoutubeCaptionsResult,
  GoogleSearchResult,
  ImageGeneratorResult,
  WebScraperResult
} from "@/types/platformTools"

export type Annotation = {
  imageGenerator__generateImage?: ImageGeneratorResult
  webScraper__youtubeCaptions?: GetYoutubeCaptionsResult
  webScraper__googleSearch?: GoogleSearchResult
  webScraper__webScraper?: WebScraperResult
}
