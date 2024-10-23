"use client"

import { useContext, useEffect } from "react"
import { notFound, useParams } from "next/navigation"
import { ChatbotUIChatContext } from "@/context/chat"
import { ChatbotUIContext } from "@/context/context"

import { useCodeBlockManager } from "@/hooks/useCodeBlockManager"
import { ChatPreviewContent } from "@/components/chat/chat-preview-content"
import { ChatUI } from "@/components/chat/chat-ui"

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

  if (!chatId) {
    return notFound()
  }

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
