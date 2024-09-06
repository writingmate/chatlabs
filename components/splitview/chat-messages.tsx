import { useChatHandler } from "@/components/splitview/splitview-hooks/use-chat-handler"
import { Tables } from "@/supabase/types"
import { forwardRef, useContext, useMemo, useState } from "react"
import { ChatbotUIChatContext } from "@/context/chat"
import { Message } from "@/components/messages/message"
import { parseChatMessageCodeBlocksAndContent } from "@/lib/messages"

interface ChatMessagesProps {}

const ChatMessages = forwardRef<ChatMessagesProps>(({}, ref) => {
  const { chatMessages, chatFileItems, isGenerating, firstTokenReceived } =
    useContext(ChatbotUIChatContext)

  const { handleSendEdit } = useChatHandler()

  const [editingMessage, setEditingMessage] = useState<Tables<"messages">>()

  return useMemo(() => {
    return (
      chatMessages
        // .sort((a, b) => a.message.sequence_number - b.message.sequence_number)
        .map((chatMessage, index, array) => {
          const parsedMessage =
            parseChatMessageCodeBlocksAndContent(chatMessage)
          const messageFileItems = chatFileItems.filter(
            (chatFileItem, _, self) =>
              parsedMessage.fileItems.includes(chatFileItem.id) &&
              self.findIndex(item => item.id === chatFileItem.id) === _
          )

          return (
            <Message
              isGenerating={isGenerating}
              firstTokenReceived={firstTokenReceived}
              codeBlocks={parsedMessage.codeBlocks}
              key={index}
              message={parsedMessage.message}
              fileItems={messageFileItems}
              isEditing={editingMessage?.id === parsedMessage.message.id}
              isLast={index === array.length - 1}
              onStartEdit={setEditingMessage}
              onCancelEdit={() => setEditingMessage(undefined)}
              onSubmitEdit={handleSendEdit}
              isExperimentalCodeEditor={false}
            />
          )
        })
    )
  }, [
    chatMessages,
    chatFileItems,
    editingMessage,
    isGenerating,
    firstTokenReceived
  ])
})

ChatMessages.displayName = "ChatMessages"

export { ChatMessages }
