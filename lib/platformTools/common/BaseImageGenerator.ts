import { BaseTool } from "./BaseTool"
import { ToolFunction } from "@/types/platformTools"
import { logger } from "@/lib/logger"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export interface ImageGenerationParams {
  prompt: string
  imageOrientation: string
}

export interface ImageGenerationUserSettings {
  output_format?: string
  aspect_ratio?: string
  model?: string
  width?: number
  height?: number
}

export const DEFAULT_IMAGE_SIZE = 1024

export const ALLOWED_DIMENSIONS = [
  "256x256",
  "512x512",
  "1024x1024",
  "1024x1792",
  "1792x1024"
] as const
export type AllowedDimension = (typeof ALLOWED_DIMENSIONS)[number]

export function validateAndNormalizeParams(
  params:
    | ImageGenerationParams
    | {
        parameters: ImageGenerationParams
      }
): ImageGenerationParams {
  logger.debug("Validating and normalizing image generation parameters")

  if ("parameters" in params) {
    params = params.parameters
  }

  let { prompt, imageOrientation } = params

  if (prompt === undefined) {
    logger.error("Prompt is missing")
    throw new Error("Prompt is required")
  }

  if (typeof prompt !== "string") {
    logger.error({ promptType: typeof prompt }, "Invalid prompt type")
    throw new Error("Prompt must be a string")
  }

  if (prompt.length < 3) {
    logger.error({ promptLength: prompt.length }, "Prompt is too short")
    throw new Error("Prompt must be at least 3 characters long")
  }

  if (
    !imageOrientation ||
    !["square", "portrait", "tall", "landscape", "wide"].includes(
      imageOrientation
    )
  ) {
    logger.debug(
      { originalAspectRatio: imageOrientation },
      "Invalid aspect ratio, defaulting to square"
    )
    imageOrientation = "square"
  }

  logger.debug(
    { prompt, imageOrientation },
    "Parameters validated and normalized"
  )
  return { prompt, imageOrientation }
}

export function calculateImageDimensions(aspectRatio: string): {
  width: number
  height: number
} {
  let dimension: AllowedDimension

  switch (aspectRatio) {
    case "portrait":
    case "tall":
      dimension = "1024x1792"
      break
    case "landscape":
    case "wide":
      dimension = "1792x1024"
      break
    default:
      dimension = "1024x1024"
  }

  const [width, height] = dimension.split("x").map(Number)

  logger.debug({ width, height }, "Image dimensions calculated")
  return { width, height }
}

export function generateMarkdownResponse(
  prompt: string,
  imageUrl: string
): string {
  logger.debug("Generating markdown response")
  return `![${prompt}](${imageUrl})\n${prompt}`
}

export abstract class BaseImageGenerator extends BaseTool {
  protected constructor(
    name: string,
    id: string,
    toolName: string,
    description: string
  ) {
    super(name, id, toolName, description)
  }

  protected abstract generateImage(
    prompt: string,
    width: number,
    height: number,
    userSettings: ImageGenerationUserSettings
  ): Promise<string>

  protected abstract getApiKey(): Promise<string | undefined>

  protected async uploadImageToSupabase(
    prompt: string,
    imageData: string
  ): Promise<string> {
    logger.debug("Starting image upload to Supabase")
    let imageBuffer: ArrayBuffer

    if (imageData.startsWith("http")) {
      const response = await fetch(imageData)
      if (!response.ok) {
        throw new Error("Failed to fetch image")
      }
      imageBuffer = await response.arrayBuffer()
    } else {
      imageBuffer = Buffer.from(imageData, "base64")
    }

    const randomString = Date.now().toString(36)
    const fileName = `${randomString}.png`
    const supabase = createClient(cookies())

    const { data, error } = await supabase.storage
      .from("generated_images")
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
        upsert: true
      })

    if (error) {
      logger.error({ error: error.message }, "Supabase upload error")
      throw new Error("Supabase upload error: " + error.message)
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from("generated_images").getPublicUrl(fileName)

    if (!publicUrl) {
      logger.error("No public URL returned from Supabase")
      throw new Error("Supabase URL error: No public URL returned")
    }

    logger.debug({ publicUrl }, "Image uploaded successfully to Supabase")
    return publicUrl
  }

  public async generate(
    params: ImageGenerationParams | { parameters: ImageGenerationParams },
    userSettings: ImageGenerationUserSettings = {}
  ): Promise<string> {
    logger.debug(`Starting ${this.constructor.name} function`)

    const { prompt, imageOrientation } = validateAndNormalizeParams(params)
    const apiKey = await this.getApiKey()

    if (!apiKey) {
      logger.error(`${this.constructor.name} API key is missing`)
      throw new Error(`${this.constructor.name} API key is required`)
    }

    const { width, height } = calculateImageDimensions(imageOrientation)

    try {
      logger.debug(`Generating image from ${this.constructor.name} API`)
      const imageData = await this.generateImage(
        prompt,
        width,
        height,
        userSettings
      )
      logger.debug("Image generated successfully")

      logger.debug("Uploading image to Supabase")
      const imageUrl = await this.uploadImageToSupabase(prompt, imageData)
      logger.debug({ imageUrl }, "Image uploaded successfully")

      return generateMarkdownResponse(prompt, imageUrl)
    } catch (error: any) {
      logger.error({ error: error.message }, "Error generating image")
      throw new Error("Error: " + error.message)
    }
  }

  protected getToolFunctions(): ToolFunction[] {
    return [
      {
        id: `imageGenerationVia${this.constructor.name}`,
        toolFunction: this.generate.bind(this),
        resultProcessingMode: "render_markdown",
        description: `Generate images using ${this.name} based on a text description. 
Returns a string with the markdown to display the image. Never display the image in the response, nor include the link or url, it is handled in the frontend.
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
            schema: { type: "string" }
          },
          {
            name: "imageOrientation",
            description:
              "The orientation and shape of the generated image. Choose 'square' for a 1:1 aspect ratio (1024x1024), 'portrait' or 'tall' for a vertical 9:16 aspect ratio (1024x1792), or 'landscape' or 'wide' for a horizontal 16:9 aspect ratio (1792x1024). If not specified, defaults to 'square'.",
            required: true,
            schema: {
              type: "string",
              enum: ["square", "portrait", "tall", "landscape", "wide"]
            }
          }
        ],
        responseSchema: {
          type: "string",
          description: "The markdown with URL of the generated image."
        }
      }
    ]
  }
}
