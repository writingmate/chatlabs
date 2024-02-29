import { ChatbotUIContext } from "@/context/context"
import { createChat } from "@/db/chats"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { ContentType, DataItemType } from "@/types"
import { useRouter } from "next/navigation"
import { FC, useContext, useRef, useState } from "react"
import { SidebarUpdateItem } from "./sidebar-update-item"
import { IconLock, IconLockAccess, IconSquarePlus } from "@tabler/icons-react"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { unique } from "next/dist/build/utils"
import { usePromptAndCommand } from "@/components/chat/chat-hooks/use-prompt-and-command"

interface SidebarItemProps {
  item: DataItemType
  isTyping: boolean
  contentType: ContentType
  icon: React.ReactNode
  updateState: any
  renderInputs: (renderState: any) => JSX.Element
}

export const SidebarItem: FC<SidebarItemProps> = ({
  item,
  contentType,
  updateState,
  renderInputs,
  icon,
  isTyping
}) => {
  const {
    selectedWorkspace,
    profile,
    setChats,
    setSelectedAssistant,
    selectedTools,
    setSelectedTools,
    chatFiles,
    setChatFiles,
    setFocusPrompt
  } = useContext(ChatbotUIContext)

  const router = useRouter()

  const itemRef = useRef<HTMLDivElement>(null)

  const { handleSelectPromptWithVariables } = usePromptAndCommand()

  const [isHovering, setIsHovering] = useState(false)

  const actionMap = {
    chats: async (item: any) => {},
    presets: async (item: any) => {},
    prompts: async (item: any) => {
      handleSelectPromptWithVariables(item)
    },
    files: async (item: any) => {
      setChatFiles([...new Set([...chatFiles, item])])
    },
    collections: async (item: any) => {},
    assistants: async (assistant: Tables<"assistants">) => {
      if (!selectedWorkspace) return

      const createdChat = await createChat({
        user_id: profile!.user_id,
        workspace_id: selectedWorkspace.id,
        assistant_id: assistant.id,
        context_length: assistant.context_length,
        include_profile_context: assistant.include_profile_context,
        include_workspace_instructions:
          assistant.include_workspace_instructions,
        model: assistant.model,
        name: `Chat with ${assistant.name}`,
        prompt: assistant.prompt,
        temperature: assistant.temperature,
        embeddings_provider: assistant.embeddings_provider
      })

      setSelectedAssistant(assistant)

      return router.push(`/${selectedWorkspace.id}/chat/${createdChat.id}`)
    },
    tools: async (item: any) => {
      setSelectedTools([...new Set([...selectedTools, item])])
    },
    models: async (item: any) => {}
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation()
      itemRef.current?.click()
    }
  }

  const handleClickAction = async (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>
  ) => {
    e.stopPropagation()

    const action = actionMap[contentType]

    await action(item as any)
  }

  const readOnly =
    item.sharing === "public" && item.user_id !== profile?.user_id

  function readOnlyClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (readOnly) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <SidebarUpdateItem
      item={item}
      isTyping={isTyping}
      contentType={contentType}
      updateState={updateState}
      renderInputs={renderInputs}
    >
      <div
        ref={itemRef}
        className={cn(
          "hover:bg-accent relative flex w-full cursor-pointer items-center rounded p-2 hover:opacity-50 focus:outline-none"
        )}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={readOnlyClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {icon}

        {readOnly && (
          <WithTooltip
            display={
              <div>
                This {contentType} is created by Writingmate team and cannot be
                edited
              </div>
            }
            trigger={
              <div
                className={
                  "bg-background/50 absolute bottom-1 left-6 rounded-xl"
                }
              >
                <IconLock size={16} />
              </div>
            }
          />
        )}

        <div className="ml-3 flex-1 justify-items-center truncate text-sm font-semibold">
          {item.name}
        </div>

        {isHovering && (
          <WithTooltip
            delayDuration={1000}
            display={<div>Start chat with {contentType.slice(0, -1)}</div>}
            trigger={
              <IconSquarePlus
                className="cursor-pointer hover:text-violet-500"
                size={20}
                onClick={handleClickAction}
              />
            }
          />
        )}
      </div>
    </SidebarUpdateItem>
  )
}
