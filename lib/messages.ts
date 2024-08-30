import { ChatMessage, CodeBlock } from "@/types"
import { Tables } from "@/supabase/types"

export const parseCodeBlocksAndContent = (
  content: string,
  messageId: string
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
        filename: filename,
        sequenceNo: blocks.length,
        messageId: messageId
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
      filename: filename,
      sequenceNo: blocks.length,
      messageId: messageId
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
  if (message.codeBlocks && message.codeBlocks.length > 0) {
    return message
  }

  const { parsedContent, codeBlocks } = parseCodeBlocksAndContent(
    message.message.content,
    message.message.id
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
    message.content,
    message.id
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

export const reconstructContentWithCodeBlocks = (
  parsedContent: string,
  codeBlocks: CodeBlock[]
): string => {
  let reconstructedContent = parsedContent

  codeBlocks.forEach((block, index) => {
    const placeholder = `[CODE_BLOCK_${index}]`
    const codeBlockContent = `\`\`\`${block.language}${block.filename ? `\n#filename=${block.filename}#` : ""}\n${block.code}\n\`\`\``
    reconstructedContent = reconstructedContent.replace(
      placeholder,
      codeBlockContent
    )
  })

  return reconstructedContent
}

export const reconstructContentWithCodeBlocksInChatMessage = (
  chatMessage: ChatMessage
): ChatMessage => {
  return {
    ...chatMessage,
    message: {
      ...chatMessage.message,
      content: reconstructContentWithCodeBlocks(
        chatMessage.message.content,
        chatMessage.codeBlocks ?? []
      )
    }
  }
}
