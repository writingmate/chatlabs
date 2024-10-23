"use client"

import { useContext } from "react"
import { ChatbotUIChatContext } from "@/context/chat"
import { ChatbotUIContext } from "@/context/context"

import { useCodeBlockManager } from "@/hooks/useCodeBlockManager"
import { ChatPreviewContent } from "@/components/chat/chat-preview-content"
import { ChatUI } from "@/components/chat/chat-ui"

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
        showClose={false}
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
