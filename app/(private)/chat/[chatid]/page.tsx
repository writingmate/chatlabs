"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { ChatPreviewContent } from "@/components/chat/chat-preview-content"
import { useContext, useEffect } from "react"
import { ChatbotUIChatContext } from "@/context/chat"
import { notFound, useParams } from "next/navigation"
import { ChatbotUIContext } from "@/context/context"
import { useCodeBlockManager } from "@/hooks/useCodeBlockManager"
import { getOgImageUrl } from "@/lib/utils/og"
import { getChatById } from "@/db/chats"

export async function generateMetadata({
  params
}: {
  params: { chatId: string }
}): Promise<Metadata> {
  // Fetch chat details here
  const chat = await getChatById(params.chatId)

  if (!chat) {
    return {
      title: "ChatLabs",
      description: "AI Chat Platform"
    }
  }

  return {
    title: chat.name,
    description: `Chat session: ${chat?.name}`,
    openGraph: {
      title: chat.name,
      images: [
        {
          url: getOgImageUrl(chat.name, `Chat session: ${chat.name}`),
          width: 1200,
          height: 630,
          alt: `${chat.name} - ChatLabs`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: chat.name,
      description: `Chat session: ${chat.name}`,
      images: [getOgImageUrl(chat.name, `Chat session: ${chat.name}`)]
    }
  }
}

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
