import { generateLocalEmbedding } from "@/lib/generate-local-embedding"
import { generateJinaEmbedding } from "@/lib/generate-jina-embedding"
import {
  processCSV,
  processJSON,
  processMarkdown,
  processPdf,
  processTxt
} from "@/lib/retrieval/processing"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database } from "@/supabase/types"
import { FileItemChunk } from "@/types"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createErrorResponse } from "@/lib/response"
import { guessFileExtensionByContentType } from "@/lib/content-type"

const maxDuration = 300
export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const profile = await getServerProfile()

    const formData = await req.formData()

    const file = formData.get("file") as File
    const file_id = formData.get("file_id") as string
    const initialProvider = formData.get("embeddingsProvider") as
      | "jina"
      | "openai"
      | "local"

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const blob = new Blob([fileBuffer])

    const fileExtension = guessFileExtensionByContentType(file.type)

    // TODO: remove below line after migration is done
    // let currentProvider: "jina" | "openai" | "local" = initialProvider || "jina"
    let currentProvider: string = "jina"

    // Check API keys first
    if (currentProvider === "jina") {
      checkApiKey(process.env.JINA_API_KEY!, "Jina")
    } else if (currentProvider === "openai") {
      if (profile.use_azure_openai) {
        checkApiKey(profile.azure_openai_api_key, "Azure OpenAI")
      } else {
        checkApiKey(profile.openai_api_key, "OpenAI")
      }
    }

    let chunks: FileItemChunk[] = []

    switch (fileExtension) {
      case "csv":
        chunks = await processCSV(blob)
        break
      case "json":
        chunks = await processJSON(blob)
        break
      case "md":
        chunks = await processMarkdown(blob)
        break
      case "pdf":
        chunks = await processPdf(blob)
        break
      case "php":
      case "js":
      case "py":
      case "java":
      case "go":
      case "c":
      case "cpp":
      case "scala":
      case "ts":
      case "octet-stream":
      // programming files
      case "txt":
        chunks = await processTxt(blob)
        break
      case "html":
        chunks = await processTxt(blob)
        break
      default:
        return createErrorResponse(
          "Unsupported file type " + fileExtension,
          400
        )
    }

    if (chunks.length === 0) {
      if (fileExtension === "pdf") {
        return createErrorResponse(
          "No text content found in PDF. If your PDF file contains images or screenshots, process those images with models like GPT-4o, or Google 1.5 Pro.",
          400
        )
      }
      return createErrorResponse("No text content found in file.", 400)
    }
    let embeddings: any = []
    if (currentProvider === "jina") {
      try {
        embeddings = await generateJinaEmbedding(
          chunks.map(chunk => chunk.content)
        )
        console.log(embeddings)
      } catch (error) {
        console.error("Jina embedding failed, falling back to OpenAI:", error)
        currentProvider = "openai"
      }
    }

    if (currentProvider === "openai") {
      let openai
      if (profile.use_azure_openai) {
        openai = new OpenAI({
          apiKey: profile.azure_openai_api_key || "",
          baseURL: `${profile.azure_openai_endpoint}/openai/deployments/${profile.azure_openai_embeddings_id}`,
          defaultQuery: { "api-version": "2023-12-01-preview" },
          defaultHeaders: { "api-key": profile.azure_openai_api_key }
        })
      } else {
        openai = new OpenAI({
          apiKey: profile.openai_api_key || "",
          organization: profile.openai_organization_id
        })
      }

      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunks.map(chunk => chunk.content)
      })

      embeddings = response.data.map((item: any) => {
        return item.embedding
      })
    } else if (currentProvider === "local") {
      const embeddingPromises = chunks.map(async chunk => {
        try {
          return await generateLocalEmbedding(chunk.content)
        } catch (error) {
          console.error(`Error generating embedding for chunk: ${chunk}`, error)
          return null
        }
      })

      embeddings = await Promise.all(embeddingPromises)
    }

    const file_items = chunks.map((chunk, index) => ({
      file_id,
      user_id: profile.user_id,
      content: chunk.content,
      tokens: chunk.tokens,
      openai_embedding:
        currentProvider === "openai"
          ? ((embeddings[index] || null) as any)
          : null,
      local_embedding:
        currentProvider === "local"
          ? ((embeddings[index] || null) as any)
          : null,
      jina_embedding:
        currentProvider === "jina" ? ((embeddings[index] || null) as any) : null
    }))
    await supabaseAdmin.from("file_items").upsert(file_items)

    const totalTokens = file_items.reduce((acc, item) => acc + item.tokens, 0)

    await supabaseAdmin
      .from("files")
      .update({ tokens: totalTokens })
      .eq("id", file_id)

    return new NextResponse("Embed Successful", {
      status: 200
    })
  } catch (error: any) {
    console.error(error)
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return createErrorResponse(errorMessage, errorCode)
  }
}
