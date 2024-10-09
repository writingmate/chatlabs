import {
  ImageGenerationUserSettings,
  BaseImageGenerator
} from "../common/BaseImageGenerator"

class StableDiffusion3Generator extends BaseImageGenerator {
  constructor() {
    super(
      "Stable Diffusion 3",
      "b3f07a6e-5e01-423e-1f05-ee51830608dd",
      "stableDiffusion3",
      "Generate images using Stable Diffusion v3 based on a text description."
    )
  }

  protected async getApiKey(): Promise<string | undefined> {
    return process.env.STABILITY_API_KEY
  }

  protected async generateImage(
    prompt: string,
    width: number,
    height: number,
    userSettings: ImageGenerationUserSettings
  ): Promise<string> {
    const apiUrl = "https://api.stability.ai/v2beta/stable-image/generate/sd3"
    const body = new FormData()

    body.append("prompt", prompt)
    body.append("width", width.toString())
    body.append("height", height.toString())

    // Calculate and append aspect ratio based on width and height
    const aspectRatio =
      width > height ? "16:9" : width < height ? "9:16" : "1:1"
    body.append("aspect_ratio", aspectRatio)

    userSettings.output_format &&
      body.append("output_format", userSettings.output_format)
    userSettings.model && body.append("model", userSettings.model)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + (await this.getApiKey()),
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
}

export const stableDiffusionTools =
  new StableDiffusion3Generator().createPlatformTool()
