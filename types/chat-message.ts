import { Json, Tables } from "@/supabase/types"

export interface CodeBlock {
  sequenceNo: number
  applicationId?: string
  messageId: string
  language: string
  code: string
  filename?: string
  version?: number
  type?: string
}

export interface ChatMessage {
  message: Tables<"messages">
  fileItems: string[]
  codeBlocks?: CodeBlock[]
}
