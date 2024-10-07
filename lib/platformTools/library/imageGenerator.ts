import OpenAI from "openai"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import {
  ImageGenerationUserSettings,
  BaseImageGenerator
} from "../common/BaseImageGenerator"

class DallE3Generator extends BaseImageGenerator {
  constructor() {
    super(
      "DALL-E 3",
      "b3f07a6e-5e01-423e-1f05-ee51830608be",
      "imageGenerator",
      "This tool allows you to generate images using OpenAI DALL-E 3 model."
    )
  }

  protected async getApiKey(): Promise<string | undefined> {
    const profile = await getServerProfile()
    return profile.openai_api_key ?? undefined
  }

  protected async generateImage(
    prompt: string,
    width: number,
    height: number,
    userSettings: ImageGenerationUserSettings
  ): Promise<string> {
    const apiKey = await this.getApiKey()
    checkApiKey(apiKey, "OpenAI")

    const openai = new OpenAI({
      apiKey: apiKey || "",
      organization: (await getServerProfile()).openai_organization_id
    })

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: `${width}x${height}` as any
    })

    return response.data[0].url as string
  }
}

export const imageGeneratorTool = new DallE3Generator().createPlatformTool()
