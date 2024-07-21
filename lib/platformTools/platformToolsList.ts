import { webScraperTool } from "./library/webScraperTool"
import { imageGeneratorTool } from "@/lib/platformTools/library/imageGenerator"
import { stableDiffusionTools } from "@/lib/platformTools/library/stableDiffusionGenerator"
import { webSearchTool } from "./library/TavilySearch"

// Add your tool to the list
export const platformToolList = [
  webScraperTool,
  imageGeneratorTool,
  stableDiffusionTools,
  webSearchTool
]
