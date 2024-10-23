import React from "react"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Message } from "@/components/messages/message"
import { Tables } from "@/supabase/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { parseDBMessageCodeBlocksAndContent } from "@/lib/messages"
import { getOgImageUrl } from "@/lib/utils/og"
import { getChatById } from "@/db/chats"
import { Metadata } from "next"

export async function generateMetadata({
  params
}: {
  params: { share_id: string }
}): Promise<Metadata> {
  // Fetch chat details here
  const chat = await getChatById(params.share_id)

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
          url: getOgImageUrl(chat.name, `Shared chat session: ${chat.name}`),
          width: 1200,
          height: 630,
          alt: `${chat.name} - ChatLabs`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: chat.name,
      description: `Shared chat session: ${chat.name}`,
      images: [getOgImageUrl(chat.name, `Shared chat session: ${chat.name}`)]
    }
  }
}

export default async function SharedChatPage({
  params
}: {
  params: { share_id: string }
}) {
  const supabase = createClient(cookies())

  let chatName = ""
  let messages: Tables<"messages">[] = []

  const { data: chatData, error: chatError } = await supabase
    .from("chats")
    .select("*, messages!messages_chat_id_fkey(*)")
    .eq("last_shared_message_id", params.share_id)
    .single()

  if (!chatData || chatError) {
    console.error("chatData not found", chatError)
    return notFound()
  }

  messages = chatData.messages

  // cut messages after last shared message
  const lastSharedMessageIndex = messages.findIndex(
    message => message.id === params.share_id
  )

  if (lastSharedMessageIndex === -1) {
    console.error("lastSharedMessageIndex not found")
    return notFound()
  }

  const chatMessages = messages
    .sort((a, b) => a.sequence_number - b.sequence_number)
    .slice(0, lastSharedMessageIndex + 1)
    .map(parseDBMessageCodeBlocksAndContent)

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="grow space-y-2">
        <h1 className="text-2xl font-bold">{chatData.name}</h1>
        <div className="text-foreground/50">
          {new Date(chatData.shared_at).toLocaleString()}
        </div>
        <div className="mb-8">
          {chatMessages.map((message, index, array) => (
            <Message
              showActions={false}
              key={message.message.id}
              message={message.message}
              isGenerating={false}
              firstTokenReceived={false}
              fileItems={[]} // Assuming no file items in shared view
              isEditing={false}
              isLast={false}
              isExperimentalCodeEditor={false}
              codeBlocks={message.codeBlocks}
            />
          ))}
        </div>
      </div>
      <div className="mb-4 mt-8 flex justify-center">
        <Link href="/">
          <Button className="rounded-full bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800">
            Get started with ChatLabs
          </Button>
        </Link>
      </div>
    </div>
  )
}
