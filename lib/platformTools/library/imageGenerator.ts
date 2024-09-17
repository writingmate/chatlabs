import { ImageGeneratorResult, PlatformTool } from "@/types/platformTools"
import OpenAI from "openai"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { uploadImageToSupabase } from "@/lib/platformTools/library/stableDiffusionGenerator"

type ImageFormat = "portrait" | "landscape" | "square"
// This function fetches data from a URL and returns it in markdown format.
const imageGenerator = async (
  params:
    | {
        parameters: { prompt: string; format: ImageFormat }
      }
    | {
        prompt: string
        format: ImageFormat
      }
): Promise<string> => {
  if ("parameters" in params) {
    params = params.parameters
  }

  let { prompt, format } = params

  if (prompt === undefined) {
    throw new Error("prompt is required")
  }

  if (typeof prompt !== "string") {
    throw new Error("prompt must be a string")
  }

  let size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024"

  if (["landscape", "wide"].includes(format)) {
    size = "1792x1024"
  }

  if (["portrait", "tall"].includes(format)) {
    size = "1024x1792"
  }

  if (format === "square") {
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
      size: size as any
    })

    const imageUrl = await uploadImageToSupabase(
      prompt,
      response.data[0].url as string
    )

    result = imageUrl as string
  } catch (error: any) {
    console.error("Failed to generate image", error, prompt, size)
    throw new Error("Failed to generate image", error)
  }

  return `
![${prompt}](${result})
${prompt}`
}

// This is the definition of the webscrapping tool.
export const imageGeneratorTool: PlatformTool = {
  id: "b3f07a6e-5e01-423e-1f05-ee51830608be", // This is the unique identifier of the tool.
  name: "DALL-E 3", // This is the name of the tool.
  toolName: "imageGenerator", // This is the name of the tool in the code.
  version: "v1.0.0", // This is the version of the tool.
  // This is the description of the tool.
  description:
    "This tool allows you to generate images from a using OpenAI DALL-E 3 model.",
  toolsFunctions: [
    {
      resultProcessingMode: "render_markdown",
      id: "generateImage", // This is the unique identifier of the tool function.
      toolFunction: imageGenerator, // This is the function that will be called when the tool function is executed.
      description: `Generate an image from a prompt. Returns the URL of the image. 
Never display the image in the response, nor include the link or url, it is handled in the frontend.
Never include image url in the response for generated images. Do not say you can't display image. 
Do not use semi-colons when describing the image. Never use html, always use Markdown.
You should only return the function call in tools call sections.
        `, // This is the description of the tool function.
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
          name: "format",
          description:
            "The format of the image to generate. Allowed values: square, portrait or tall, or landscape or wide. Defaults to square.",
          required: true,
          schema: {
            type: "string"
          }
        }
      ]
    }
  ]
}
