"use client"

import Loading from "@/components/ui/loading"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { getAssistantToolsByAssistantId } from "@/db/assistant-tools"
import { getChatFilesByChatId } from "@/db/chat-files"
import { getMessagesByChatId } from "@/db/messages"
import { getMessageImageFromStorage } from "@/db/storage/message-images"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLMID, MessageImage } from "@/types"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams
} from "next/navigation"
import { FC, useContext, useEffect, useState } from "react"
import { ChatHelp } from "./chat-help"
import { useScroll } from "./chat-hooks/use-scroll"
import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"
import { QuickSettings } from "@/components/chat/quick-settings"
import { ChatSettings } from "@/components/chat/chat-settings"
import { Brand } from "@/components/ui/brand"
import { useTheme } from "next-themes"
import { IconEdit, IconMessagePlus, IconSettings } from "@tabler/icons-react"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { ChatbotUIChatContext } from "@/context/chat"
import { Tables } from "@/supabase/types"
import { getPromptById } from "@/db/prompts"
import { usePromptAndCommand } from "@/components/chat/chat-hooks/use-prompt-and-command"
import { parseIdFromSlug, slugify } from "@/lib/slugify"
import { AssistantIcon } from "@/components/assistants/assistant-icon"
import { useAuth } from "@/context/auth"
import { ConversationStarters } from "@/components/chat/conversation-starters"
import { ChatPreviewContent } from "@/components/chat/chat-preview-content"
import { cn } from "@/lib/utils"

interface ChatUIProps {
  showModelSelector?: boolean
  assistant?: Tables<"assistants">
}

export const ChatUI: FC<ChatUIProps> = ({
  assistant,
  showModelSelector = true
}) => {
  useHotkey("o", () => handleNewChat())
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const params = useParams()

  const chatid = params.chatid

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const {
    prompts,
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
    setUserInput,
    setSelectedChat,
    setChatSettings,
    setChatFileItems,
    setSelectedTools,
    chatMessages,
    setChatMessages
  } = useContext(ChatbotUIChatContext)

  const { handleNewChat, handleFocusChatInput, handleSendMessage } =
    useChatHandler()

  const { handleSelectPromptWithVariables } = usePromptAndCommand()

  const {
    messagesStartRef,
    messagesEndRef,
    handleScroll,
    scrollToBottom,
    setIsAtBottom
  } = useScroll()

  const { user } = useAuth()

  const [loading, setLoading] = useState(true)

  const [previewContent, setPreviewContent] = useState<string>("")

  const { theme } = useTheme()

  function handlePreviewContent(content: string) {
    setPreviewContent(content)
    if (content) {
      setShowSidebar(false)
    }
  }

  useEffect(() => {
    if (showSidebar) {
      setPreviewContent("")
    }
  }, [showSidebar])

  useEffect(() => {
    if (assistant) {
      setSelectedAssistant(selectedAssistant)
    }
    if (!chatid) {
      setLoading(false)
      return
    }
    const fetchData = async () => {
      await Promise.all([fetchMessages(), fetchChat()])

      scrollToBottom()
      setIsAtBottom(true)
    }

    if ((chatMessages?.length === 0 && !chatid) || !!chatid) {
      fetchData().then(() => {
        handleFocusChatInput()
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    const promptId = searchParams.get("prompt_id")
    const modelId = searchParams.get("model")

    if (promptId) {
      getPromptById(parseIdFromSlug(promptId))
        .then(prompt => {
          handleSelectPromptWithVariables(prompt)
        })
        .catch(console.error)
    }

    if (modelId) {
      setChatSettings(prev => ({
        ...prev,
        model: modelId as LLMID
      }))
    }

    router.replace(pathname)
  }, [searchParams])

  const fetchMessages = async () => {
    const chat = chats.find(chat => chat.id === chatid)
    const fetchedMessages = await getMessagesByChatId(chat?.id as string)

    const imagePromises: Promise<MessageImage>[] = fetchedMessages.flatMap(
      message =>
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

    const images: MessageImage[] = await Promise.all(imagePromises.flat())
    //
    // const messageFileItemPromises = fetchedMessages.map(
    //   async message => await getMessageFileItemsByMessageId(message.id)
    // )
    // const messageFileItems = await Promise.all(messageFileItemPromises)

    const uniqueFileItems = fetchedMessages.flatMap(item => item.file_items)
    const chatFiles = await getChatFilesByChatId(chat!.id as string)

    setChatFiles(
      chatFiles.files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        file: null
      }))
    )

    const fetchedChatMessages = fetchedMessages.map(message => {
      const fileItems = message.file_items.map(fileItem => fileItem.id)
      return {
        message,
        fileItems
      }
    })

    setChatImages(images)
    setChatFileItems(uniqueFileItems)
    setUseRetrieval(true)
    setShowFilesDisplay(true)

    setChatMessages(fetchedChatMessages)
  }

  const fetchChat = async () => {
    const chat = chats.find(chat => chat.id === chatid)

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

  return (
    <div
      onScroll={handleScroll}
      className={
        "relative flex size-full flex-1 flex-col overflow-hidden overflow-y-auto"
      }
    >
      <div className="bg-background sticky top-0 z-50 flex w-full justify-between p-2">
        <div className="flex items-center">
          {!showSidebar && (
            <WithTooltip
              delayDuration={200}
              display={<div>Start a new chat</div>}
              trigger={
                <IconMessagePlus
                  className="ml-2 cursor-pointer hover:opacity-50"
                  size={24}
                  stroke={1.5}
                  onClick={handleNewChat}
                />
              }
            />
          )}
          {!assistant && <QuickSettings />}
          {/*{selectedAssistant && user?.id === selectedAssistant.user_id && (*/}
          {/*  <Button className={"text-foreground"} variant={"ghost"}>*/}
          {/*    <Link href={`/a/${slugify(selectedAssistant)}/edit`}>*/}
          {/*      <IconEdit size={24} stroke={1.5} />*/}
          {/*    </Link>*/}
          {/*  </Button>*/}
          {/*)}*/}
        </div>
        {showModelSelector && <ChatSettings />}
      </div>

      <div className="flex size-full">
        {loading ? (
          <Loading />
        ) : (
          <div
            className={
              "relative mx-auto flex size-full max-w-2xl flex-1 flex-col transition-[width]"
            }
          >
            {chatMessages?.length === 0 ? (
              <div className="flex w-full flex-1 flex-col items-center justify-center">
                {!selectedAssistant ? (
                  <Brand theme={theme === "dark" ? "dark" : "light"} />
                ) : (
                  <>
                    <AssistantIcon
                      className={"size-[100px] rounded-xl"}
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
            ) : (
              <div className="flex-1">
                <div ref={messagesStartRef} />
                <ChatMessages onPreviewContent={handlePreviewContent} />
                <div className={"h-10"} ref={messagesEndRef} />
              </div>
            )}

            <div className="sticky bottom-2 mx-2 items-end">
              {chatMessages?.length === 0 && (
                <ConversationStarters
                  values={selectedAssistant?.conversation_starters}
                  onSelect={value =>
                    handleSendMessage(value, chatMessages, false)
                  }
                />
              )}
              <ChatInput showAssistant={!selectedAssistant} />
            </div>
          </div>
        )}

        <div
          className={cn(
            "w-0 transition-[width] duration-100",
            previewContent && "w-full lg:w-[calc(50%-2rem)]"
          )}
        />
        {previewContent && (
          <ChatPreviewContent
            content={previewContent}
            onPreviewContent={handlePreviewContent}
          />
        )}
      </div>

      {/*<div className="absolute bottom-2 right-2 hidden md:block lg:bottom-4 lg:right-4">*/}
      {/*  <ChatHelp/>*/}
      {/*</div>*/}
    </div>
  )
}
