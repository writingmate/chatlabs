import { ChatMessage, CodeBlock } from "@/types"
import { Tables } from "@/supabase/types"

export const parseCodeBlocksAndContent = (
  content: string
): { parsedContent: string; codeBlocks: CodeBlock[] } => {
  const blocks: CodeBlock[] = []
  let remainingContent = content

  // Parse complete code blocks
  const completeBlockRegex = /```(\w+)?\s*(?:#filename=(.+?)#)?\n([\s\S]*?)```/g
  remainingContent = remainingContent.replace(
    completeBlockRegex,
    (_, lang, filename, code) => {
      blocks.push({
        language: lang || "text",
        code: code.trim(),
        filename: filename
      })
      return `[CODE_BLOCK_${blocks.length - 1}]`
    }
  )

  // Check for an unfinished code block at the end
  const unfinishedBlockRegex = /```(\w+)?\s*(?:#filename=(.+?)#)?\n([\s\S]*?)$/
  const unfinishedMatch = remainingContent.match(unfinishedBlockRegex)
  if (unfinishedMatch) {
    const [fullMatch, lang, filename, code] = unfinishedMatch
    blocks.push({
      language: lang || "text",
      code: code.trim(),
      filename: filename
    })
    remainingContent = remainingContent.replace(
      fullMatch,
      `[CODE_BLOCK_${blocks.length - 1}]`
    )
  }

  return { parsedContent: remainingContent, codeBlocks: blocks }
}

export function parseChatMessageCodeBlocksAndContent(
  message: ChatMessage
): ChatMessage {
  const { parsedContent, codeBlocks } = parseCodeBlocksAndContent(
    message.message.content
  )
  return {
    ...message,
    message: {
      ...message.message,
      content: parsedContent
    },
    codeBlocks
  }
}

export const parseDBMessageCodeBlocksAndContent = (
  message: Tables<"messages"> & {
    file_items?: { id: string }[]
  }
): ChatMessage => {
  const { parsedContent, codeBlocks } = parseCodeBlocksAndContent(
    message.content
  )
  return {
    message: {
      ...message,
      content: parsedContent
    },
    fileItems: message.file_items?.map(item => item.id) || [],
    codeBlocks
  }
}
