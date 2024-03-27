import { ImageGeneratorResult, PlatformTool } from "@/types/platformTools"
import OpenAI from "openai"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"

type ImageSize = "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792"
// This function fetches data from a URL and returns it in markdown format.
const imageGenerator = async (
  params:
    | {
        parameters: { prompt: string; size: ImageSize }
      }
    | {
        prompt: string
        size: ImageSize
      }
): Promise<ImageGeneratorResult> => {
  if ("parameters" in params) {
    params = params.parameters
  }

  let { prompt, size } = params

  if (prompt === undefined) {
    throw new Error("prompt is required")
  }

  if (typeof prompt !== "string") {
    throw new Error("prompt must be a string")
  }

  if (size !== "1024x1024" && size !== "1792x1024" && size !== "1024x1792") {
    size = "1024x1024"
  }

  const profile = await getServerProfile()

  let result = ""

  try {
    checkApiKey(profile.openai_api_key, "OpenAI")
    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id
    })

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size
    })

    result = response.data[0].url as string
  } catch (error: any) {
    console.error("Failed to generate image", error, prompt, size)
    throw new Error("Failed to generate image", error)
  }

  return {
    prompt: prompt,
    url: result
  }
}

// This is the definition of the webscrapping tool.
export const imageGeneratorTool: PlatformTool = {
  id: "b3f07a6e-5e01-423e-1f05-ee51830608be", // This is the unique identifier of the tool.
  name: "Image Generation", // This is the name of the tool.
  toolName: "imageGenerator", // This is the name of the tool in the code.
  version: "v1.0.0", // This is the version of the tool.
  // This is the description of the tool.
  description: "This tool allows you to generate images from a prompt.",
  toolsFunctions: [
    {
      id: "generateImage", // This is the unique identifier of the tool function.
      toolFunction: imageGenerator, // This is the function that will be called when the tool function is executed.
      description:
        "Generate an image from a prompt. Returns the URL of the image. Never display the image in the response, nor include the link or url, it is handled in the frontend.", // This is the description of the tool function.
      parameters: [
        // These are the parameters of the tool function.
        {
          name: "prompt",
          description:
            "The prompt, a detailed description, to generate an image from. ",
          required: true,
          schema: {
            type: "string"
          }
        },
        {
          name: "size",
          description:
            "The size of the image to generate. Allowed values: 1024x1024 (square), 1792x1024 (portrait), 1024x1792 (landscape). Defaults to 1024x1024.",
          required: false,
          schema: {
            type: "string"
          }
        }
      ]
    }
  ]
}
