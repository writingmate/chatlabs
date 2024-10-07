"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { ChatPreviewContent } from "@/components/chat/chat-preview-content"
import { useContext } from "react"
import { ChatbotUIContext } from "@/context/context"
import { ChatbotUIChatContext } from "@/context/chat"
import { useCodeBlockManager } from "@/hooks/useCodeBlockManager"

export default function ChatPage() {
  const { profile } = useContext(ChatbotUIContext)
  const { isGenerating, chatMessages } = useContext(ChatbotUIChatContext)
  const {
    selectedCodeBlock,
    handleSelectCodeBlock,
    handleCodeChange,
    isEditable
  } = useCodeBlockManager(chatMessages)

  return (
    <>
      <ChatUI
        onSelectCodeBlock={handleSelectCodeBlock}
        experimentalCodeEditor={!!profile?.experimental_code_editor}
      />
      <ChatPreviewContent
        open={!!selectedCodeBlock}
        isGenerating={isGenerating}
        selectedCodeBlock={selectedCodeBlock}
        onSelectCodeBlock={handleSelectCodeBlock}
        isEditable={isEditable}
        onCodeChange={handleCodeChange}
      />
    </>
  )
}
