import Replicate from "replicate"
import {
  ImageGenerationUserSettings,
  BaseImageGenerator
} from "../common/BaseImageGenerator"

class Flux1ProGenerator extends BaseImageGenerator {
  constructor() {
    super(
      "FLUX.1 Pro",
      "b3f07a6e-5e01-423e-1f05-ee51830608da",
      "flux1Pro",
      "Generate images using FLUX.1 Pro based on a text description."
    )
  }

  protected async getApiKey(): Promise<string | undefined> {
    return process.env.REPLICATE_API_TOKEN
  }

  protected async generateImage(
    prompt: string,
    width: number,
    height: number,
    userSettings: ImageGenerationUserSettings
  ): Promise<string> {
    const aspect_ratio =
      width > height ? "16:9" : width < height ? "9:16" : "1:1"

    const input = {
      steps: 25,
      prompt: prompt,
      guidance: 3,
      interval: 2,
      aspect_ratio: aspect_ratio,
      safety_tolerance: 2
    }

    const replicate = new Replicate({
      auth: await this.getApiKey()
    })

    // @ts-ignore
    const result = await replicate.run("black-forest-labs/flux-pro", {
      input
    })

    //@ts-ignore
    return result as string
  }
}

export const flux1ProTools = new Flux1ProGenerator().createPlatformTool()
