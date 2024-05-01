import { Tables } from "@/supabase/types"
import { ContentType, DataListType } from "@/types"
import { FC, useContext, useState } from "react"
import { SidebarCreateButtons } from "./sidebar-create-buttons"
import { SidebarDataList } from "./sidebar-data-list"
import {
  SIDEBAR_ICON_SIZE,
  SidebarSwitcher
} from "@/components/sidebar2/sidebar-switcher"
import {
  IconMessageCircle,
  IconMessageCirclePlus,
  IconPencil,
  IconSearch
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { SidebarSearch } from "@/components/sidebar2/sidebar-search"
import { Button } from "@/components/ui/button"
import { isMobileScreen } from "@/lib/mobile"
import { ChatbotUIContext } from "@/context/context"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { cn } from "@/lib/utils"

interface SidebarTopContentProps {
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  contentType: ContentType
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarTopContent: FC<SidebarTopContentProps> = ({
  searchTerm,
  setSearchTerm,
  contentType,
  onContentTypeChange
}) => {
  const { setShowSidebar } = useContext(ChatbotUIContext)
  const { handleNewChat } = useChatHandler()

  function handleCreateChat() {
    handleNewChat()
    if (isMobileScreen()) {
      setShowSidebar(false)
    }
  }

  return (
    // Subtract 50px for the height of the workspace settings
    <div className="flex flex-col">
      <div className={"bg-background z-50"}>
        <div className="mt-1 flex items-center">
          <Button
            className="flex h-auto grow justify-start p-2"
            onClick={handleCreateChat}
          >
            <IconMessageCirclePlus stroke={1.5} size={SIDEBAR_ICON_SIZE} />
            <div className="ml-3">New Chat</div>
          </Button>
        </div>
        <SidebarSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>
      <SidebarSwitcher
        className={cn(
          "transition-[margin] duration-300",
          // searchTerm && `-mt-[${32 * 3}px]`
          searchTerm && `-mt-24`
        )}
        contentType={contentType}
        onContentTypeChange={onContentTypeChange}
      />
    </div>
  )
}
