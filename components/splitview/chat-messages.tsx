import { useChatHandler } from "@/components/splitview/splitview-hooks/use-chat-handler"
import { Tables } from "@/supabase/types"
import {
  FC,
  forwardRef,
  useContext,
  useImperativeHandle,
  useState
} from "react"
import { Message } from "@/components/splitview/message"
import { ChatbotUIChatContext } from "@/context/chat"

interface ChatMessagesProps {}

const ChatMessages = forwardRef<ChatMessagesProps>(({}, ref) => {
  const { chatMessages, chatFileItems, isGenerating } =
    useContext(ChatbotUIChatContext)

  const { handleSendEdit, handleStopMessage, handleSendMessage } =
    useChatHandler()

  const [editingMessage, setEditingMessage] = useState<Tables<"messages">>()

  return chatMessages
    .sort((a, b) => a.message.sequence_number - b.message.sequence_number)
    .map((chatMessage, index, array) => {
      const messageFileItems = chatFileItems.filter(
        (chatFileItem, _, self) =>
          chatMessage.fileItems.includes(chatFileItem.id) &&
          self.findIndex(item => item.id === chatFileItem.id) === _
      )

      return (
        <Message
          key={chatMessage.message.sequence_number}
          message={chatMessage.message}
          fileItems={messageFileItems}
          isEditing={editingMessage?.id === chatMessage.message.id}
          isLast={index === array.length - 1}
          onStartEdit={setEditingMessage}
          onCancelEdit={() => setEditingMessage(undefined)}
          onSubmitEdit={handleSendEdit}
        />
      )
    })
})

ChatMessages.displayName = "ChatMessages"

export { ChatMessages }
