import { FC, useCallback, useContext, useMemo, useRef } from "react"
import { useParams } from "next/navigation"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { LLM } from "@/types"
import { IconApps } from "@tabler/icons-react"
import { useRouter } from "nextjs-toploader/app"

import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import { AssistantIcon } from "@/components/assistants/assistant-icon"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ModelIcon } from "@/components/models/model-icon"
import {
  SIDEBAR_ITEM_ICON_SIZE,
  SIDEBAR_ITEM_ICON_STROKE
} from "@/components/sidebar/items/all/sidebar-display-item"
import { PinChat } from "@/components/sidebar/items/chat/pin-chat"

import { DeleteChat } from "./delete-chat"
import { UpdateChat } from "./update-chat"

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
    allModels,
    setChats
  } = useContext(ChatbotUIContext)

  const { handleNewChat } = useChatHandler()

  const router = useRouter()
  const params = useParams()
  const isActive = params?.chatid === chat.id || selectedChat?.id === chat.id

  const itemRef = useRef<HTMLDivElement>(null)

  const application = (
    chat as Tables<"chats"> & { applications: Tables<"applications">[] }
  ).applications?.[0]

  const handleClick = useCallback(() => {
    if (application) {
      return router.push(`/applications/${application.id}`)
    }
    return router.push(`/chat/${chat.id}`)
  }, [chat, application, router, selectedWorkspace])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        e.stopPropagation()
        itemRef.current?.click()
      }
    },
    [chat, application, router, selectedWorkspace]
  )

  const MODEL_DATA = useMemo(
    () => allModels.find(llm => llm.modelId === chat.model) as LLM,
    [allModels, chat.model]
  )

  const assistant = useMemo(
    () =>
      chat.assistant_id
        ? assistants.find(a => a.id === chat.assistant_id)
        : null,
    [chat, assistants]
  )

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
        {application ? (
          <div
            className={cn(
              "text-muted-foreground border-foreground/10 flex items-center justify-center rounded border"
            )}
            style={{
              width: SIDEBAR_ITEM_ICON_SIZE,
              height: SIDEBAR_ITEM_ICON_SIZE
            }}
          >
            <IconApps
              size={SIDEBAR_ITEM_ICON_SIZE - 4}
              stroke={SIDEBAR_ITEM_ICON_STROKE}
            />
          </div>
        ) : assistant ? (
          <AssistantIcon assistant={assistant} size={SIDEBAR_ITEM_ICON_SIZE} />
        ) : (
          <ModelIcon
            provider={MODEL_DATA?.provider}
            modelId={MODEL_DATA?.modelId}
            height={SIDEBAR_ITEM_ICON_SIZE}
            width={SIDEBAR_ITEM_ICON_SIZE}
          />
        )}

        <div className="ml-3 flex-1 truncate text-sm">
          {application ? application.name : chat.name}
        </div>

        <div
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
          }}
          className={`ml-2 flex space-x-2`}
        >
          {application ? null : (
            <>
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
            </>
          )}
          <PinChat
            className={
              !isActive && !chat.pinned ? " hidden group-hover:flex" : ""
            }
            setChats={setChats}
            chat={chat as any}
          />
        </div>
      </div>
    ),
    [chat, isActive]
  )
}
