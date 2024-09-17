import { PlatformTool } from "@/types/platformTools"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

interface ImageGenerationViaStableDiffusion3Params {
  prompt: string
}

interface ImageGenerationViaStableDiffusion3UserSettings {
  output_format?: string
  aspect_ratio?: string
  model?: string
}

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
    const imageData = await generateImageFromStabilityAPI(
      stabilityAPIKey,
      prompt,
      userSettings
    )

    const imageUrl = await uploadImageToSupabase(prompt, imageData)

    // return markdown to display the image
    return `![${prompt}](${imageUrl})\n${prompt}`
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
  return data.image // Return the base64 image data
}

function convertToBuffer(dataOrUrl: string) {
  if (dataOrUrl.startsWith("http")) {
    return fetch(dataOrUrl).then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch image")
      }
      return res.arrayBuffer()
    })
  } else {
    return Buffer.from(dataOrUrl, "base64")
  }
}

export async function uploadImageToSupabase(prompt: string, imageData: string) {
  // if it's a url, fetch the image
  let imageBuffer = await convertToBuffer(imageData)
  // add random string to filename to avoid conflicts
  const randomString = Date.now().toString(36)
  const fileName = `${randomString}.png`
  const supabase = createClient(cookies())

  const { data, error } = await supabase.storage
    .from("generated_images") // Replace with your actual bucket name
    .upload(fileName, imageBuffer, {
      contentType: "image/png",
      upsert: true
    })

  if (error) {
    throw new Error("Supabase upload error: " + error.message)
  }

  const {
    data: { publicUrl }
  } = supabase.storage
    .from("generated_images") // Replace with your actual bucket name
    .getPublicUrl(fileName)

  if (!publicUrl) {
    throw new Error("Supabase URL error: No public URL returned")
  }

  return publicUrl
}

export const stableDiffusionTools: PlatformTool = {
  id: "b3f07a6e-5e01-423e-1f05-ee51830608dd",
  name: "Stable Diffusion 3",
  toolName: "stableDiffusion3",
  version: "v1.0.0",
  description:
    "Generate images using Stable Diffusion v3 based on a text description.",
  toolsFunctions: [
    {
      id: "imageGenerationViaStableDiffusion3",
      toolFunction: stableDiffusion3,
      resultProcessingMode: "render_markdown",
      description: `Generate images using Stable Diffusion v3 based on a text description. 
Returns the URL of the image. Never display the image in the response, nor include the link or url, it is handled in the frontend.
Never include image url in the response for generated images. Do not say you can't display image. 
Do not use semi-colons when describing the image. Never use html, always use Markdown.
You should only return the function call in tools call sections.
        `,
      parameters: [
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
