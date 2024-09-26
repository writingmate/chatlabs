export interface GenerateImageParams {
  aspectRatio: string
  resolution: string
  style: string
  numberOfImages: number // New Parameter
  guidanceScale: number // New Parameter
}

export const generateImage = async (
  prompt: string,
  params: GenerateImageParams
): Promise<string> => {
  try {
    const response = await fetch("/api/generate-image", {
      // Ensure this API route exists and is correctly configured
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, ...params })
    })

    if (!response.ok) {
      throw new Error("Image generation failed")
    }

    const data = await response.json()
    return data.imageUrl // Ensure your API returns an `imageUrl` field
  } catch (error) {
    console.error("Error in generateImage:", error)
    throw error
  }
}
