import { VALID_ENV_KEYS } from "@/types/valid-keys"

export async function generateJinaEmbedding(
  texts: string[]
): Promise<number[][]> {
  const url = "https://api.jina.ai/v1/embeddings"
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.JINA_API_KEY}`
  }

  const data = {
    model: VALID_ENV_KEYS.JINA_MODEL_NAME,
    task: VALID_ENV_KEYS.JINA_TASK_NAME,
    dimensions: VALID_ENV_KEYS.JINA_DIMENSION,
    late_chunking: VALID_ENV_KEYS.JINA_LATE_CHUNKING ? true : false,
    embedding_type: VALID_ENV_KEYS.JINA_EMBEDDING_TYPE,
    input: texts
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data)
    })

    const res = await response.json()
    return res.data.map((value: { embedding: any }) => value.embedding)
  } catch (error) {
    console.error("Jina Embedding Error:", error)
    throw new Error("Jina embedding generation failed")
  }
}
