"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { ChatPreviewContent } from "@/components/chat/chat-preview-content"
import { useState, useContext } from "react"
import { CodeBlock } from "@/types/chat-message"
import { ChatbotUIChatContext } from "@/context/chat"
import { useCodeChange } from "@/hooks/useCodeChange"
import { useCodeBlockEditable } from "@/hooks/useCodeBlockEditable"

export default function ChatIDPage() {
  const [selectedCodeBlock, setSelectedCodeBlock] = useState<CodeBlock | null>(
    null
  )
  const { isGenerating } = useContext(ChatbotUIChatContext)
  const handleCodeChange = useCodeChange(
    selectedCodeBlock,
    setSelectedCodeBlock
  )
  const isCodeBlockEditable = useCodeBlockEditable()

  return (
    <>
      <ChatUI onSelectCodeBlock={setSelectedCodeBlock} />
      <ChatPreviewContent
        open={!!selectedCodeBlock}
        isGenerating={isGenerating}
        selectedCodeBlock={selectedCodeBlock}
        onSelectCodeBlock={setSelectedCodeBlock}
        isEditable={isCodeBlockEditable(selectedCodeBlock)}
        onCodeChange={handleCodeChange}
      />
    </>
  )
}
