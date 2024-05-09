import { PlatformTool } from "@/types/platformTools"

interface ImageGenerationViaStableDiffusion3Params {
  prompt: string
}

interface ImageGenerationViaStableDiffusion3UserSettings {
  output_format?: string
  aspect_ratio?: string
  model?: string
}

// This function fetches data from a URL and returns it in markdown format.
async function stableDiffusion3(
  params:
    | ImageGenerationViaStableDiffusion3Params
    | { parameters: ImageGenerationViaStableDiffusion3Params },
  userSettings: ImageGenerationViaStableDiffusion3UserSettings = {}
) {
  if ("parameters" in params) {
    params = params.parameters
  }
  const { prompt } = params
  const stabilityAPIKey = process.env.STABILITY_API_KEY

  if (!stabilityAPIKey) {
    throw new Error("Stability API key is required")
  }

  if (prompt === undefined) {
    throw new Error("Prompt is required")
  }

  if (prompt.length < 10) {
    throw new Error("Prompt must be at least 10 characters long")
  }

  try {
    return await generateImageFromStabilityAPI(
      stabilityAPIKey,
      prompt,
      userSettings
    )
  } catch (error: any) {
    console.error("Error generating image:", error)
    throw new Error("Error: " + error.message)
  }
}

async function generateImageFromStabilityAPI(
  apiKey: string,
  prompt: string,
  {
    output_format,
    aspect_ratio,
    model
  }: ImageGenerationViaStableDiffusion3UserSettings = {}
) {
  const apiUrl = "https://api.stability.ai/v2beta/stable-image/generate/sd3"

  const body = new FormData()

  body.append("prompt", prompt)

  output_format && body.append("output_format", output_format)
  aspect_ratio && body.append("aspect_ratio", aspect_ratio)
  model && body.append("model", model)

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      Accept: "application/json; type=image/*"
    },
    body: body
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      "Stability API error: " + response.status + ", Message: " + errorText
    )
  }

  const data = await response.json()
  return (
    "![" +
    prompt +
    "](data:image/" +
    (output_format || "png") +
    ";base64," +
    data.image +
    ")"
  )
}

// This is the definition of the webscrapping tool.
export const stableDiffusionTools: PlatformTool = {
  id: "b3f07a6e-5e01-423e-1f05-ee51830608dd", // This is the unique identifier of the tool.
  name: "Stable Diffusion 3", // This is the name of the tool.
  toolName: "stableDiffusion3", // This is the name of the tool in the code.
  version: "v1.0.0", // This is the version of the tool.
  // This is the description of the tool.
  description:
    "Generate images using Stable Diffusion v3 based on a text description.",
  toolsFunctions: [
    {
      id: "imageGenerationViaStableDiffusion3", // This is the unique identifier of the tool function.
      toolFunction: stableDiffusion3, // This is the function that will be called when the tool function is executed.
      resultProcessingMode: "render_markdown",
      description:
        "Generate images using Stable Diffusion v3 based on a text description. ", // This is the description of the tool function.
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
