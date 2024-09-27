"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { ChatPreviewContent } from "@/components/chat/chat-preview-content"
import { useState, useContext } from "react"
import { CodeBlock } from "@/types/chat-message"
import { ChatbotUIContext } from "@/context/context"
import { ChatbotUIChatContext } from "@/context/chat"
import { useCodeChange } from "@/hooks/useCodeChange"
import { useCodeBlockEditable } from "@/hooks/useCodeBlockEditable"

export default function ChatPage() {
  const [selectedCodeBlock, setSelectedCodeBlock] = useState<CodeBlock | null>(
    null
  )
  const { profile } = useContext(ChatbotUIContext)
  const { isGenerating } = useContext(ChatbotUIChatContext)
  const handleCodeChange = useCodeChange(
    selectedCodeBlock,
    setSelectedCodeBlock
  )
  const isCodeBlockEditable = useCodeBlockEditable()

  return (
    <>
      <ChatUI
        onSelectCodeBlock={setSelectedCodeBlock}
        experimentalCodeEditor={!!profile?.experimental_code_editor}
      />
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
