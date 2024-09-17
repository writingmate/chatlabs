import { PlatformTool } from "@/types/platformTools"
import Replicate from "replicate"
import { uploadImageToSupabase } from "@/lib/platformTools/library/stableDiffusionGenerator"

interface ImageGenerationViaFlux3ProParams {
  prompt: string
}

interface ImageGenerationViaFlux3ProUserSettings {
  output_format?: string
  aspect_ratio?: string
}

// This function fetches data from a URL and returns it in markdown format.
async function flux1Pro(
  params:
    | ImageGenerationViaFlux3ProParams
    | { parameters: ImageGenerationViaFlux3ProParams },
  userSettings: ImageGenerationViaFlux3ProUserSettings = {}
) {
  if ("parameters" in params) {
    params = params.parameters
  }
  const { prompt } = params
  const apiKey = process.env.REPLICATE_API_TOKEN

  if (!apiKey) {
    throw new Error("Replicate API key is required")
  }

  if (prompt === undefined) {
    throw new Error("Prompt is required")
  }

  if (prompt.length < 10) {
    throw new Error("Prompt must be at least 10 characters long")
  }

  try {
    return await generateImageFromReplicateAPI(apiKey, prompt, userSettings)
  } catch (error: any) {
    console.error("Error generating image:", error)
    throw new Error("Error: " + error.message)
  }
}

async function generateImageFromReplicateAPI(
  apiKey: string,
  prompt: string,
  { output_format, aspect_ratio }: ImageGenerationViaFlux3ProUserSettings = {}
) {
  const input = {
    steps: 25,
    prompt: prompt,
    guidance: 3,
    interval: 2,
    aspect_ratio: aspect_ratio,
    safety_tolerance: 2
  }

  const replicate = new Replicate({
    auth: apiKey
  })

  // @ts-ignore
  const result = await replicate.run("black-forest-labs/flux-pro", {
    input
  })

  const imageUrl = await uploadImageToSupabase(prompt, result as any)

  return `
![${prompt}](${imageUrl})
${prompt}
  `
}

export const flux1ProTools: PlatformTool = {
  id: "b3f07a6e-5e01-423e-1f05-ee51830608da", // This is the unique identifier of the tool.
  name: "FLUX.1 Pro", // This is the name of the tool.
  toolName: "flux1Pro", // This is the name of the tool in the code.
  version: "v1.0.0", // This is the version of the tool.
  // This is the description of the tool.
  description: "Generate images using FLUX.1 Pro based on a text description.",
  toolsFunctions: [
    {
      id: "imageGenerationViaFluxPro", // This is the unique identifier of the tool function.
      toolFunction: flux1Pro, // This is the function that will be called when the tool function is executed.
      resultProcessingMode: "render_markdown",
      description: `Generate images using FLUX.1 Pro based on a text description. 
Returns the URL of the image.
Do not use semi-colons when describing the image. Never use html, always use Markdown.
        `, // This is the description of the tool function.
      parameters: [
        // These are the parameters of the tool function.
        {
          name: "prompt",
          description:
            "The prompt, a detailed description, to generate an image from.",
          required: true,
          schema: {
            type: "string"
          }
        }
      ]
    }
  ]
}
