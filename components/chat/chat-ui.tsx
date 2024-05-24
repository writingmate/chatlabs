import Loading from "@/components/ui/loading"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { getAssistantToolsByAssistantId } from "@/db/assistant-tools"
import { getChatFilesByChatId } from "@/db/chat-files"
import { getChatById } from "@/db/chats"
import { getMessageFileItemsByMessageId } from "@/db/message-file-items"
import { getMessagesByChatId } from "@/db/messages"
import { getMessageImageFromStorage } from "@/db/storage/message-images"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLMID, MessageImage } from "@/types"
import { useParams } from "next/navigation"
import { FC, useContext, useEffect, useState } from "react"
import { ChatHelp } from "./chat-help"
import { useScroll } from "./chat-hooks/use-scroll"
import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"
import { ChatScrollButtons } from "./chat-scroll-buttons"
import { ChatSecondaryButtons } from "./chat-secondary-buttons"
import { QuickSettings } from "@/components/chat/quick-settings"
import { ChatSettings } from "@/components/chat/chat-settings"
import { Brand } from "@/components/ui/brand"
import { useTheme } from "next-themes"
import { IconMessagePlus } from "@tabler/icons-react"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { ChatbotUIChatContext } from "@/context/chat"

interface ChatUIProps {}

export const ChatUI: FC<ChatUIProps> = ({}) => {
  useHotkey("o", () => handleNewChat())
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const params = useParams()

  const {
    setChatImages,
    assistants,
    setSelectedAssistant,
    setChatFiles,
    setShowFilesDisplay,
    setUseRetrieval,
    showSidebar
  } = useContext(ChatbotUIContext)

  const {
    setSelectedChat,
    setChatSettings,
    setChatFileItems,
    setSelectedTools,
    chatMessages,
    setChatMessages
  } = useContext(ChatbotUIChatContext)

  const { handleNewChat, handleFocusChatInput } = useChatHandler()

  const {
    messagesStartRef,
    messagesEndRef,
    handleScroll,
    scrollToBottom,
    setIsAtBottom,
    isAtTop,
    isAtBottom,
    isOverflowing,
    scrollToTop
  } = useScroll()

  const [loading, setLoading] = useState(true)

  const { theme } = useTheme()

  useEffect(() => {
    if (!params.chatid) {
      setLoading(false)
      return
    }
    const fetchData = async () => {
      await Promise.all([fetchMessages(), fetchChat()])

      scrollToBottom()
      setIsAtBottom(true)
    }

    if ((chatMessages?.length === 0 && !params.chatid) || params.chatid) {
      fetchData().then(() => {
        handleFocusChatInput()
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [params])

  const fetchMessages = async () => {
    const fetchedMessages = await getMessagesByChatId(params.chatid as string)

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

    setChatImages(images)

    const messageFileItemPromises = fetchedMessages.map(
      async message => await getMessageFileItemsByMessageId(message.id)
    )

    const messageFileItems = await Promise.all(messageFileItemPromises)

    const uniqueFileItems = messageFileItems.flatMap(item => item.file_items)
    setChatFileItems(uniqueFileItems)

    const chatFiles = await getChatFilesByChatId(params.chatid as string)

    setChatFiles(
      chatFiles.files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        file: null
      }))
    )

    setUseRetrieval(true)
    setShowFilesDisplay(true)

    const fetchedChatMessages = fetchedMessages.map(message => {
      return {
        message,
        fileItems: messageFileItems
          .filter(messageFileItem => messageFileItem.id === message.id)
          .flatMap(messageFileItem =>
            messageFileItem.file_items.map(fileItem => fileItem.id)
          )
      }
    })

    setChatMessages(fetchedChatMessages)
  }

  const fetchChat = async () => {
    const chat = await getChatById(params.chatid as string)
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

  if (loading) {
    return <Loading />
  }

  return (
    <div className="relative flex h-full flex-col items-center">
      <div className="sticky top-0 flex w-full justify-between p-2">
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
          <QuickSettings />
        </div>
        <ChatSettings />
      </div>

      {chatMessages.length == 0 ? (
        <>
          <div className="absolute left-1/2 top-1/2 mb-20 -translate-x-1/2 -translate-y-1/2">
            <Brand theme={theme === "dark" ? "dark" : "light"} />
          </div>

          <div className="flex grow flex-col items-center justify-center" />
        </>
      ) : (
        <div
          className="flex size-full flex-col overflow-auto pt-4"
          onScroll={handleScroll}
        >
          <div ref={messagesStartRef} />

          <div
            className={
              "mx-auto w-[300px] pb-8 sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px]"
            }
          >
            <ChatMessages />
          </div>

          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="relative w-full items-end px-4 pb-8 md:w-[500px] lg:w-[660px] xl:w-[800px]">
        <ChatInput />
      </div>

      <div className="absolute bottom-2 right-2 hidden md:block lg:bottom-4 lg:right-4">
        <ChatHelp />
      </div>
    </div>
  )
}
