import { generateJinaEmbedding } from "@/lib/generate-jina-embedding"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import { unique } from "next/dist/build/utils"

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

    const jinaApiKey = process.env.JINA_API_KEY
    if (!jinaApiKey) {
      throw new Error("Admin Jina API key is not set.")
    }

    try {
      const embeddings = await generateJinaEmbedding([userInput])
      const jinaEmbedding = embeddings[0] // Get the first (and only) embedding
      const { data: jinaFileItems, error: jinaError } = await supabaseAdmin.rpc(
        "match_file_items_jina",
        {
          query_embedding: jinaEmbedding as any,
          match_count: sourceCount,
          file_ids: uniqueFileIds
        }
      )

      if (jinaError) {
        if (jinaError.message.includes("jina_embedding does not exist")) {
          console.error("Jina embedding column is missing in the database")
          throw new Error(
            "Database schema issue: jina_embedding column is missing"
          )
        }
        throw jinaError
      }

      chunks = jinaFileItems
    } catch (error) {
      console.error("Jina embedding failed:", error)
      throw new Error("Failed to generate or retrieve embeddings")
    }

    const mostSimilarChunks = chunks?.sort(
      (a, b) => b.similarity - a.similarity
    )

    console.log(mostSimilarChunks)

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
