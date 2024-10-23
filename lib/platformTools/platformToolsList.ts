import { imageGeneratorTool } from "@/lib/platformTools/library/imageGenerator"
import { flux1ProTools } from "@/lib/platformTools/library/lfuxImageGenerator"
import { stableDiffusionTools } from "@/lib/platformTools/library/stableDiffusionGenerator"

import { webScraperTool } from "./library/webScraperTool"

// Add your tool to the list
export const platformToolList = [
  webScraperTool,
  imageGeneratorTool,
  stableDiffusionTools,
  flux1ProTools
]
