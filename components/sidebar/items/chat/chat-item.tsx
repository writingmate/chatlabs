import { ModelIcon } from "@/components/models/model-icon"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { ChatbotUIContext } from "@/context/context"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { LLM } from "@/types"
import { IconRobotFace } from "@tabler/icons-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { FC, useContext, useMemo, useRef } from "react"
import { DeleteChat } from "./delete-chat"
import { UpdateChat } from "./update-chat"
import { SIDEBAR_ITEM_ICON_SIZE } from "@/components/sidebar/items/all/sidebar-display-item"
import { PinChat } from "@/components/sidebar/items/chat/pin-chat"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { AssistantIcon } from "@/components/assistants/assistant-icon"

interface ChatItemProps {
  chat: Tables<"chats">
}

export const ChatItem: FC<ChatItemProps> = ({ chat }) => {
  const {
    assistants,
    selectedWorkspace,
    selectedChat,
    availableLocalModels,
    assistantImages,
    availableOpenRouterModels,
    setChats
  } = useContext(ChatbotUIContext)

  const { handleNewChat } = useChatHandler()

  const router = useRouter()
  const params = useParams()
  const isActive = params?.chatid === chat.id || selectedChat?.id === chat.id

  const itemRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    if (!selectedWorkspace) return
    return router.push(`/chat/${chat.id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation()
      itemRef.current?.click()
    }
  }

  const MODEL_DATA = [
    ...LLM_LIST,
    ...availableLocalModels,
    ...availableOpenRouterModels
  ].find(llm => llm.modelId === chat.model) as LLM

  const assistantImage = assistantImages.find(
    image => image.assistantId === chat.assistant_id
  )?.base64

  const assistant = chat.assistant_id
    ? assistants.find(a => a.id === chat.assistant_id)
    : null

  return useMemo(
    () => (
      <div
        ref={itemRef}
        className={cn(
          "hover:bg-accent focus:bg-accent group flex w-full cursor-pointer items-center rounded p-2 hover:opacity-50 focus:outline-none",
          isActive && "bg-accent"
        )}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
      >
        {assistant ? (
          <AssistantIcon assistant={assistant} size={SIDEBAR_ITEM_ICON_SIZE} />
        ) : (
          <ModelIcon
            provider={MODEL_DATA?.provider}
            modelId={MODEL_DATA?.modelId}
            height={SIDEBAR_ITEM_ICON_SIZE}
            width={SIDEBAR_ITEM_ICON_SIZE}
          />
        )}

        <div className="ml-3 flex-1 truncate text-sm">{chat.name}</div>

        <div
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
          }}
          className={`ml-2 flex space-x-2`}
        >
          <UpdateChat
            className={!isActive ? " hidden group-hover:flex" : ""}
            chat={chat}
            setChats={setChats}
          />
          <DeleteChat
            className={!isActive ? " hidden group-hover:flex" : ""}
            chat={chat}
            setChats={setChats}
            handleNewChat={handleNewChat}
          />
          <PinChat
            className={
              !isActive && !chat.pinned ? " hidden group-hover:flex" : ""
            }
            setChats={setChats}
            chat={chat}
          />
        </div>
      </div>
    ),
    [chat, isActive]
  )
}
