import { Json, Tables } from "@/supabase/types"

export interface CodeBlock {
  language: string
  code: string
  filename?: string
}

export interface ChatMessage {
  message: Tables<"messages">
  fileItems: string[]
  codeBlocks?: CodeBlock[]
}
