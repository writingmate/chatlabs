import { FileItemChunk } from "@/types"
import { encode } from "gpt-tokenizer"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { CHUNK_OVERLAP, CHUNK_SIZE } from "."

export const processUrl = async (url: string): Promise<FileItemChunk[]> => {
  // Fetch HTML content
  const response = await fetch(url)
  const html = await response.text()

  // Create a text splitter for HTML
  const splitter = RecursiveCharacterTextSplitter.fromLanguage("html", {
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP
  })

  // Split the HTML content
  const splitDocs = await splitter.createDocuments([html])

  // Create chunks
  const chunks: FileItemChunk[] = splitDocs.map(doc => ({
    content: doc.pageContent,
    tokens: encode(doc.pageContent).length
  }))

  return chunks
}
