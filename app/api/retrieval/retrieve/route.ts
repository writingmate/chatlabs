import { generateCohereEmbedding } from "@/lib/generate-cohere-embedding"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const json = await request.json()
  const { userInput, fileIds, sourceCount } = json as {
    userInput: string
    fileIds: string[]
    sourceCount: number
  }

  const uniqueFileIds = [...new Set(fileIds)]

  try {
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const profile = await getServerProfile()

    let chunks: any[] = []
    let embedding: number[] = []

    const cohereApiKey = process.env.COHERE_API_KEY
    if (!cohereApiKey) {
      throw new Error("Admin Cohere API key is not set.")
    }

    try {
      const embeddings = await generateCohereEmbedding([userInput])
      const cohereEmbedding = embeddings[0] // Get the first (and only) embedding

      const { data: cohereFileItems, error: cohereError } =
        await supabaseAdmin.rpc("match_file_items_cohere", {
          query_embedding: cohereEmbedding as any,
          match_count: sourceCount,
          file_ids: uniqueFileIds
        })

      if (cohereError) {
        if (cohereError.message.includes("cohere_embedding does not exist")) {
          console.error("Cohere embedding column is missing in the database")
          throw new Error(
            "Database schema issue: cohere_embedding column is missing"
          )
        }
        throw cohereError
      }

      chunks = cohereFileItems
    } catch (error) {
      console.error("Cohere embedding failed:", error)
      throw new Error("Failed to generate or retrieve embeddings")
    }

    const mostSimilarChunks = chunks?.sort(
      (a, b) => b.similarity - a.similarity
    )

    return new Response(JSON.stringify({ results: mostSimilarChunks }), {
      status: 200
    })
  } catch (error: any) {
    console.error(error)
    const errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
