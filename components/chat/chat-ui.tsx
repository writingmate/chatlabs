"use client"

import React, { useContext, useEffect, useState } from "react"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams
} from "next/navigation"
import { ChatbotUIContext } from "@/context/context"
import { ChatbotUIChatContext } from "@/context/chat"
import { useAuth } from "@/context/auth"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { usePromptAndCommand } from "@/components/chat/chat-hooks/use-prompt-and-command"
import { useScroll } from "./chat-hooks/use-scroll"
import useHotkey from "@/lib/hooks/use-hotkey"
import { useTheme } from "next-themes"
import { LLMID, MessageImage } from "@/types"
import { Tables } from "@/supabase/types"
import { parseIdFromSlug } from "@/lib/slugify"
import { cn } from "@/lib/utils"

import Loading from "@/components/ui/loading"
import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"
import { QuickSettings } from "@/components/chat/quick-settings"
import { ChatSettings } from "@/components/chat/chat-settings"
import { Brand } from "@/components/ui/brand"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { AssistantIcon } from "@/components/assistants/assistant-icon"
import { ConversationStarters } from "@/components/chat/conversation-starters"
import { ChatPreviewContent } from "@/components/chat/chat-preview-content"

import { IconMessagePlus } from "@tabler/icons-react"

import { getPromptById } from "@/db/prompts"
import { getAssistantToolsByAssistantId } from "@/db/assistant-tools"
import { getChatFilesByChatId } from "@/db/chat-files"
import { getMessagesByChatId } from "@/db/messages"
import { getMessageImageFromStorage } from "@/db/storage/message-images"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { ChatMessageCounter } from "@/components/chat/chat-message-counter"
import { Virtualizer } from "virtua"
import { bo } from "@upstash/redis/zmscore-10fd3773"

interface ChatUIProps {
  showModelSelector?: boolean
  assistant?: Tables<"assistants">
}

export const ChatUI: React.FC<ChatUIProps> = ({
  assistant,
  showModelSelector = true
}) => {
  const params = useParams()
  const chatId = params.chatid as string
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { theme } = useTheme()

  const { user } = useAuth()

  const {
    chats,
    setChatImages,
    assistants,
    setSelectedAssistant,
    setChatFiles,
    setShowFilesDisplay,
    setUseRetrieval,
    showSidebar,
    setShowSidebar,
    selectedAssistant
  } = useContext(ChatbotUIContext)

  const {
    setSelectedChat,
    setChatSettings,
    setChatFileItems,
    setSelectedTools,
    chatMessages,
    setChatMessages,
    isGenerating
  } = useContext(ChatbotUIChatContext)

  const { handleNewChat, handleFocusChatInput, handleSendMessage } =
    useChatHandler()
  const { handleSelectPromptWithVariables } = usePromptAndCommand()
  const {
    scrollRef,
    messagesStartRef,
    messagesEndRef,
    handleScroll,
    scrollToBottom,
    setIsAtBottom
  } = useScroll()

  const [editorOpen, setEditorOpen] = useState(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [previewContent, setPreviewContent] = useState<{
    content: string
    filename?: string
    update: boolean
  } | null>(null)

  useHotkey("o", handleNewChat)
  useHotkey("l", handleFocusChatInput)

  useEffect(() => {
    if (assistant) {
      setSelectedAssistant(assistant)
    }
    if (!chatId) {
      setLoading(false)
      return
    }
    fetchChatData()
  }, [params, chatId, assistant])

  useEffect(() => {
    handleSearchParams()
  }, [searchParams])

  useEffect(() => {
    if (showSidebar) {
      setPreviewContent(null)
    }
  }, [showSidebar])

  const fetchChatData = async (): Promise<void> => {
    await Promise.all([fetchMessages(), fetchChat()])
    scrollToBottom()
    setIsAtBottom(true)
    handleFocusChatInput()
    setLoading(false)
  }

  const handleSearchParams = (): void => {
    const promptId = searchParams.get("prompt_id")
    const modelId = searchParams.get("model")

    if (promptId) {
      getPromptById(parseIdFromSlug(promptId))
        .then(prompt => {
          if (prompt) handleSelectPromptWithVariables(prompt)
        })
        .catch(console.error)
    }

    if (modelId) {
      setChatSettings(prev => ({ ...prev, model: modelId as LLMID }))
    }

    router.replace(pathname)
  }

  const fetchMessages = async (): Promise<void> => {
    const chat = chats.find(chat => chat.id === chatId)
    if (!chat) return

    const fetchedMessages = await getMessagesByChatId(chat.id)

    const images = await fetchMessageImages(fetchedMessages)
    const uniqueFileItems = fetchedMessages.flatMap(item => item.file_items)
    const chatFiles = await getChatFilesByChatId(chat.id)

    setChatImages(images)
    setChatFileItems(uniqueFileItems)
    setUseRetrieval(true)
    setShowFilesDisplay(true)
    setChatFiles(
      chatFiles.files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        file: null
      }))
    )
    setChatMessages(
      fetchedMessages.map(message => ({
        message,
        fileItems: message.file_items.map(fileItem => fileItem.id)
      }))
    )
  }

  const fetchMessageImages = async (
    messages: Tables<"messages">[]
  ): Promise<MessageImage[]> => {
    const imagePromises = messages.flatMap(message =>
      message.image_paths
        ? message.image_paths.map(async imagePath => {
            const url = await getMessageImageFromStorage(imagePath)
            if (url) {
              const response = await fetch(url)
              const blob = await response.blob()
              const base64 = await convertBlobToBase64(blob)
              return {
                messageId: message.id,
                path: imagePath,
                base64,
                url,
                file: null
              }
            }
            return {
              messageId: message.id,
              path: imagePath,
              base64: "",
              url,
              file: null
            }
          })
        : []
    )
    return Promise.all(imagePromises)
  }

  const fetchChat = async (): Promise<void> => {
    const chat = chats.find(chat => chat.id === chatId)
    if (!chat) return

    if (chat.assistant_id) {
      const assistant = assistants.find(
        assistant => assistant.id === chat.assistant_id
      )
      if (assistant) {
        setSelectedAssistant(assistant)
        const assistantTools = (
          await getAssistantToolsByAssistantId(assistant.id)
        ).tools
        setSelectedTools(assistantTools)
      }
    }

    setSelectedChat(chat)
    setChatSettings({
      model: chat.model as LLMID,
      prompt: chat.prompt,
      temperature: chat.temperature,
      contextLength: chat.context_length,
      includeProfileContext: chat.include_profile_context,
      includeWorkspaceInstructions: chat.include_workspace_instructions,
      embeddingsProvider: chat.embeddings_provider as "openai" | "local"
    })
  }

  const handlePreviewContent = (
    content: {
      content: string
      filename?: string
      update: boolean
    } | null
  ): void => {
    setPreviewContent(prev => {
      if (content && !content.update) {
        setEditorOpen(true)
      }
      if (!content) {
        setEditorOpen(false)
      }
      return content
    })
    if (editorOpen) {
      setShowSidebar(false)
    }
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="relative flex size-full flex-1 flex-col overflow-hidden overflow-y-auto"
    >
      {/* Header */}
      <div className="bg-background sticky top-0 z-20 flex h-14 w-full shrink-0 justify-between p-2">
        <div className="flex items-center">
          {(!showSidebar || assistant) && (
            <WithTooltip
              delayDuration={200}
              display={<div>Start a new chat</div>}
              trigger={
                <IconMessagePlus
                  className="ml-2 cursor-pointer hover:opacity-50"
                  size={24}
                  stroke={1.5}
                  onClick={() =>
                    handleNewChat(assistant ? "/a/" + assistant.hashid : "")
                  }
                />
              }
            />
          )}
          {!assistant && <QuickSettings />}
        </div>
        {showModelSelector && <ChatSettings />}
      </div>

      {/* Chat Content */}
      <div className="flex size-full">
        {loading ? (
          <Loading />
        ) : (
          <div className="relative mx-auto flex size-full max-w-2xl flex-1 flex-col">
            {chatMessages?.length === 0 ? (
              <EmptyChatView
                selectedAssistant={selectedAssistant}
                theme={theme}
              />
            ) : (
              <>
                <div ref={messagesStartRef} />
                <ChatMessages onPreviewContent={handlePreviewContent} />
                <div ref={messagesEndRef} className="min-h-20 flex-1" />
              </>
            )}
            <div className="bg-background sticky bottom-0 mx-2 items-end pb-2">
              {chatMessages?.length === 0 && (
                <ConversationStarters
                  values={selectedAssistant?.conversation_starters}
                  onSelect={(value: string) =>
                    handleSendMessage(value, chatMessages, false)
                  }
                />
              )}
              <ChatInput showAssistant={!selectedAssistant} />
              <ChatMessageCounter />
            </div>
          </div>
        )}

        <div
          className={cn(
            "w-0 transition-[width] duration-100",
            editorOpen && "w-full lg:w-[calc(50%-2rem)]"
          )}
        />

        <ChatPreviewContent
          open={editorOpen}
          isGenerating={isGenerating}
          content={previewContent}
          onPreviewContent={handlePreviewContent}
        />
      </div>
    </div>
  )
}

interface EmptyChatViewProps {
  selectedAssistant: Tables<"assistants"> | null
  theme: string | undefined
}

const EmptyChatView: React.FC<EmptyChatViewProps> = ({
  selectedAssistant,
  theme
}) => (
  <div className="center flex w-full flex-1 flex-col items-center justify-center transition-[height]">
    {!selectedAssistant ? (
      <Brand theme={theme === "dark" ? "dark" : "light"} />
    ) : (
      <>
        <AssistantIcon
          className="size-[100px] rounded-xl"
          assistant={selectedAssistant}
          size={100}
        />
        <div className="text-foreground mt-4 text-center text-2xl font-bold">
          {selectedAssistant.name}
        </div>
        <div className="text-foreground mt-2 text-center text-sm">
          {selectedAssistant.description}
        </div>
      </>
    )}
  </div>
)
