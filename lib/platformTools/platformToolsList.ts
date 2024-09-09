import { webScraperTool } from "./library/webScraperTool"
import { imageGeneratorTool } from "@/lib/platformTools/library/imageGenerator"
import { stableDiffusionTools } from "@/lib/platformTools/library/stableDiffusionGenerator"
import { flux1ProTools } from "@/lib/platformTools/library/lfuxImageGenerator"
import { exaResearcherTool } from "./library/exaSearch"

// Add your tool to the list
export const platformToolList = [
  webScraperTool,
  imageGeneratorTool,
  stableDiffusionTools,
  flux1ProTools,
  exaResearcherTool
]
