import { CohereClient } from "cohere-ai"

export async function generateCohereEmbedding(
  texts: string[]
): Promise<number[][]> {
  const cohereApiKey = process.env.COHERE_API_KEY
  if (!cohereApiKey) {
    throw new Error("Admin Cohere API key is not set")
  }

  const cohere = new CohereClient({
    token: cohereApiKey
  })

  try {
    const response = await cohere.embed({
      texts,
      model: "embed-multilingual-light-v3.0",
      inputType: "search_document"
    })

    if (!Array.isArray(response.embeddings)) {
      throw new Error("Unexpected embeddings format")
    }

    return response.embeddings
  } catch (error) {
    console.error("Cohere Embedding Error:", error)
    throw new Error("Cohere embedding generation failed")
  }
}
