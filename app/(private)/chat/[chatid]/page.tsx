"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { ChatPreviewContent } from "@/components/chat/chat-preview-content"
import { useContext, useEffect } from "react"
import { ChatbotUIChatContext } from "@/context/chat"
import { useParams } from "next/navigation"
import { ChatbotUIContext } from "@/context/context"
import { useCodeBlockManager } from "@/hooks/useCodeBlockManager"

export default function ChatIDPage() {
  const { chatMessages, isGenerating } = useContext(ChatbotUIChatContext)
  const { profile } = useContext(ChatbotUIContext)
  const {
    selectedCodeBlock,
    handleSelectCodeBlock,
    handleCodeChange,
    isEditable
  } = useCodeBlockManager(chatMessages)

  const params = useParams()
  const chatId = params?.chatid as string

  return (
    <>
      <ChatUI
        onSelectCodeBlock={handleSelectCodeBlock}
        chatId={chatId}
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
