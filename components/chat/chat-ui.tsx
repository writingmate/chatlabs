"use client"

import React, { useCallback, useContext, useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { ChatbotUIContext } from "@/context/context"
import { ChatbotUIChatContext } from "@/context/chat"
import { useAuth } from "@/context/auth"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { usePromptAndCommand } from "@/components/chat/chat-hooks/use-prompt-and-command"
import { useScroll } from "./chat-hooks/use-scroll"
import useHotkey from "@/lib/hooks/use-hotkey"
import { useTheme } from "next-themes"
import { ChatMessage, LLMID, MessageImage } from "@/types"
import { Tables } from "@/supabase/types"
import { parseIdFromSlug } from "@/lib/slugify"

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
import {
  getMessageById,
  getMessagesByChatId,
  updateMessage
} from "@/db/messages"
import { getMessageImageFromStorage } from "@/db/storage/message-images"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { ChatMessageCounter } from "@/components/chat/chat-message-counter"
import { getFileByHashId } from "@/db/files"
import {
  parseChatMessageCodeBlocksAndContent,
  parseDBMessageCodeBlocksAndContent,
  reconstructContentWithCodeBlocks,
  reconstructContentWithCodeBlocksInChatMessage
} from "@/lib/messages"
import { CodeBlock } from "@/types/chat-message"

interface ChatUIProps {
  showModelSelector?: boolean
  assistant?: Tables<"assistants">
}

export const ChatUI: React.FC<ChatUIProps> = ({
  assistant,
  showModelSelector = true
}) => {
  const params = useParams()
  const chatId = params?.chatid as string
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
    chatSettings,
    setSelectedChat,
    setChatSettings,
    setChatFileItems,
    setSelectedTools,
    chatMessages,
    setChatMessages,
    isGenerating
  } = useContext(ChatbotUIChatContext)

  const {
    handleNewChat,
    handleFocusChatInput,
    handleSendMessage,
    handleSendEdit
  } = useChatHandler()

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
  const [selectedCodeBlock, setSelectedCodeBlock] = useState<CodeBlock | null>(
    null
  )

  useHotkey("o", handleNewChat)
  useHotkey("l", handleFocusChatInput)

  useEffect(() => {
    if (assistant) {
      setSelectedAssistant(assistant)
      setChatSettings({
        ...chatSettings,
        model: assistant.model as LLMID,
        prompt: assistant.prompt,
        temperature: assistant.temperature,
        contextLength: assistant.context_length,
        includeProfileContext: assistant.include_profile_context,
        includeWorkspaceInstructions: assistant.include_workspace_instructions,
        embeddingsProvider: assistant.embeddings_provider as
          | "jina"
          | "openai"
          | "local"
      })
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

  const fetchChatData = async (): Promise<void> => {
    await Promise.all([fetchMessages(), fetchChat()])
    scrollToBottom()
    setIsAtBottom(true)
    handleFocusChatInput()
    setLoading(false)
  }

  const createRemixMessages = (
    filename: string,
    content: string
  ): ChatMessage[] =>
    [
      {
        fileItems: [],
        message: {
          content: `Remixing ${filename}`,
          annotation: {},
          assistant_id: null,
          created_at: new Date().toISOString(),
          role: "user",
          chat_id: chatId,
          id: "",
          image_paths: [],
          model: chatSettings?.model!,
          sequence_number: 0,
          updated_at: null,
          user_id: user?.id!,
          word_count: 0
        }
      },
      {
        fileItems: [],
        message: {
          content: `\`\`\`html
#filename=${filename}#
${content}
\`\`\``,
          annotation: {},
          assistant_id: null,
          created_at: new Date().toISOString(),
          role: "assistant",
          chat_id: chatId,
          id: "",
          image_paths: [],
          model: chatSettings?.model!,
          sequence_number: 1,
          updated_at: null,
          user_id: user?.id!,
          word_count: 0
        }
      }
    ].map(parseChatMessageCodeBlocksAndContent)

  async function handleForkMessage(messageId: string, sequenceNo: number) {
    const message = await getMessageById(messageId)
    if (message) {
      const codeBlock =
        parseDBMessageCodeBlocksAndContent(message)?.codeBlocks?.[sequenceNo]
      if (codeBlock && codeBlock.language === "html" && codeBlock.filename) {
        await handleNewChat(
          "",
          createRemixMessages(codeBlock.filename, codeBlock.code)
        )
      }
    }
  }

  function handleRemixFile(fileId: string) {
    getFileByHashId(fileId).then(file => {
      if (chatMessages?.length === 0 && file && file.type === "html") {
        setChatMessages(
          createRemixMessages(file.name, file.file_items[0].content)
        )
      }
    })
  }

  const handleSearchParams = (): void => {
    const promptId = searchParams?.get("prompt_id")
    const modelId = searchParams?.get("model") as LLMID
    const remixFileId = searchParams?.get("remix")
    const forkMessageId = searchParams?.get("forkMessageId")
    const forkSequenceNo = parseInt(searchParams?.get("forkSequenceNo") || "-1")

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

    if (chatMessages?.length === 0 && remixFileId) {
      handleRemixFile(remixFileId)
    }

    if (chatMessages?.length === 0 && forkMessageId && forkSequenceNo > -1) {
      handleForkMessage(forkMessageId, forkSequenceNo)
    }
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
    setChatMessages(fetchedMessages.map(parseDBMessageCodeBlocksAndContent))
  }

  useEffect(() => {
    if (chatMessages?.length > 0) {
      const lastMessage = chatMessages[chatMessages.length - 1]
      const codeBlocks = lastMessage?.codeBlocks
      if (
        codeBlocks &&
        codeBlocks.length > 0 &&
        !!codeBlocks[codeBlocks.length - 1].filename
      ) {
        setSelectedCodeBlock(codeBlocks[codeBlocks.length - 1])
      }
    }
  }, [chatMessages])

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
      embeddingsProvider: chat.embeddings_provider as
        | "jina"
        | "openai"
        | "local"
    })
  }

  const handleSelectCodeBlock = useCallback(
    (codeBlock: CodeBlock | null): void => {
      setSelectedCodeBlock(prev => {
        if (codeBlock) {
          setEditorOpen(true)
        } else {
          setEditorOpen(false)
        }
        return codeBlock
      })
    },
    []
  )

  const handleCodeChange = (updatedCode: string): void => {
    if (selectedCodeBlock) {
      const updatedMessage = chatMessages?.find(
        message => message.message?.id === selectedCodeBlock.messageId
      )
      if (
        updatedMessage &&
        updatedMessage.codeBlocks &&
        updatedMessage.codeBlocks.length > 0
      ) {
        updatedMessage.codeBlocks[updatedMessage.codeBlocks.length - 1].code =
          updatedCode
        setChatMessages(prev => {
          const updatedMessages = [...prev]
          const index = updatedMessages.findIndex(
            message => message.message?.id === selectedCodeBlock.messageId
          )
          if (index !== -1) {
            updatedMessages[index] = updatedMessage
          }
          return updatedMessages
        })
        setSelectedCodeBlock(
          updatedMessage.codeBlocks[updatedMessage.codeBlocks.length - 1]
        )
        updateMessage(updatedMessage.message!.id, {
          content: reconstructContentWithCodeBlocks(
            updatedMessage.message?.content || "",
            updatedMessage.codeBlocks
          )
        })
      }
    }
  }

  const isCodeBlockEditable = useCallback(
    (codeBlock: CodeBlock | null): boolean => {
      if (!codeBlock) return false
      // only allow editing if the code block is the last one in the conversation
      // we need to find the last message that has a code block
      const lastMessage = chatMessages
        ?.filter(message => message.codeBlocks && message.codeBlocks.length > 0)
        .pop()
      return lastMessage?.message?.id === codeBlock.messageId && !isGenerating
    },
    [chatMessages, isGenerating]
  )

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex h-full flex-1 shrink-0 flex-col overflow-hidden overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-background sticky top-0 z-20 flex h-14 w-full shrink-0 justify-between p-2">
          <div className="flex items-center">
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
                  <ChatMessages onSelectCodeBlock={handleSelectCodeBlock} />
                  <div ref={messagesEndRef} className="min-h-20 flex-1" />
                </>
              )}
              <div className="sticky bottom-0 mx-2 items-end bg-transparent pb-2 backdrop-blur-sm">
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
        </div>
      </div>
      <ChatPreviewContent
        open={editorOpen}
        isGenerating={isGenerating}
        selectedCodeBlock={selectedCodeBlock}
        onSelectCodeBlock={handleSelectCodeBlock}
        isEditable={isCodeBlockEditable(selectedCodeBlock)}
        onCodeChange={handleCodeChange}
      />
    </>
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
