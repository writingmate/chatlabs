import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { FC, useContext, useMemo, useState } from "react"
import { Message } from "../messages/message"
import { ChatbotUIChatContext } from "@/context/chat"
import { CodeBlock } from "@/types/chat-message"
import { isMobileScreen } from "@/lib/mobile"

interface ChatMessagesProps {
  onSelectCodeBlock?: (codeBlock: CodeBlock | null) => void
  isExperimentalCodeEditor: boolean
}

export const ChatMessages: FC<ChatMessagesProps> = ({
  onSelectCodeBlock,
  isExperimentalCodeEditor
}) => {
  const {
    chatMessages,
    chatFileItems,
    isGenerating,
    setIsGenerating,
    firstTokenReceived
  } = useContext(ChatbotUIChatContext)

  const { handleSendEdit, handleSendMessage } = useChatHandler()

  async function handleRegenerate(editedMessage?: string) {
    setIsGenerating(true)

    await handleSendMessage(
      editedMessage || chatMessages[chatMessages.length - 2].message.content,
      chatMessages,
      true
    )
  }

  const [editingMessage, setEditingMessage] = useState<Tables<"messages">>()

  const isMobile = isMobileScreen()

  return useMemo(
    () =>
      chatMessages
        .sort((a, b) => a.message.sequence_number - b.message.sequence_number)
        .map((chatMessage, index, array) => {
          const messageFileItems = chatFileItems.filter(
            (chatFileItem, _, self) =>
              chatMessage.fileItems.includes(chatFileItem.id) &&
              self.findIndex(item => item.id === chatFileItem.id) === _
          )

          return (
            <Message
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              firstTokenReceived={firstTokenReceived}
              key={index}
              codeBlocks={chatMessage.codeBlocks}
              message={chatMessage.message}
              fileItems={messageFileItems}
              isEditing={editingMessage?.id === chatMessage.message.id}
              isLast={index === array.length - 1}
              onStartEdit={setEditingMessage}
              onCancelEdit={() => setEditingMessage(undefined)}
              onSubmitEdit={handleSendEdit}
              onSelectCodeBlock={onSelectCodeBlock}
              onRegenerate={handleRegenerate}
              showResponseTime={false}
              isExperimentalCodeEditor={isExperimentalCodeEditor}
            />
          )
        }),
    [
      chatMessages,
      chatFileItems,
      editingMessage,
      isGenerating,
      firstTokenReceived,
      onSelectCodeBlock,
      isMobile
    ]
  )
}
