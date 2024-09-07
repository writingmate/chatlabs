import { FC, useState, useContext, useRef, useEffect } from "react"
import { SidebarItem } from "./sidebar-item"
import { SlidingSubmenu } from "./sliding-submenu"
import { SidebarCreateButtons } from "./sidebar-create-buttons"
import {
  IconMessage,
  IconPuzzle,
  IconFolder,
  IconTool,
  IconApps,
  IconChevronRight,
  IconChevronLeft,
  IconMessagePlus,
  IconRobot,
  IconX,
  IconMenu2,
  IconMessage2Plus
} from "@tabler/icons-react"
import { ChatbotUIContext } from "@/context/context"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"
import { SIDEBAR_ITEM_ICON_SIZE } from "@/components/sidebar/items/all/sidebar-display-item"
import { useParams, useRouter } from "next/navigation"
import { SearchInput } from "../ui/search-input"
import { ProfileSettings } from "../utility/profile-settings"
import { useChatHandler } from "../chat/chat-hooks/use-chat-handler"
import { SidebarDataList } from "./sidebar-data-list"
import { ContentType } from "@/types"

export const Sidebar: FC = () => {
  const {
    chats,
    prompts,
    files,
    tools,
    assistants,
    folders,
    setChats,
    setPrompts,
    setFiles,
    setTools,
    setAssistants,
    showSidebar,
    setShowSidebar
  } = useContext(ChatbotUIContext)
  const { handleNewChat } = useChatHandler()
  const [activeSubmenu, setActiveSubmenu] = useState<ContentType | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const params = useParams()
  const router = useRouter()

  const [searchQueries, setSearchQueries] = useState({
    chats: "",
    prompts: "",
    assistants: "",
    files: "",
    tools: ""
  })

  useEffect(() => {
    const storedCollapsedState = localStorage.getItem("sidebarCollapsed")
    setIsCollapsed(storedCollapsedState === "true")
    setIsLoaded(true)
  }, [])

  const handleSubmenuOpen = (menuName: ContentType) => {
    if (isCollapsed) {
      setIsCollapsed(false)
    }
    setActiveSubmenu(menuName === activeSubmenu ? null : menuName)
  }

  const handleCreateItem = (contentType: ContentType) => {
    setIsCreating(true)
  }

  const toggleCollapseOrSubmenu = () => {
    if (activeSubmenu) {
      setActiveSubmenu(null)
    } else {
      setIsCollapsed(!isCollapsed)
      localStorage.setItem("sidebarCollapsed", (!isCollapsed).toString())
    }
  }

  const handleCreateChat = () => {
    handleNewChat()
  }

  const iconProps = {
    size: SIDEBAR_ITEM_ICON_SIZE,
    stroke: 1.5,
    className: "text-muted-foreground"
  }

  const getDataForContentType = (contentType: ContentType) => {
    switch (contentType) {
      case "chats":
        return chats
      case "prompts":
        return prompts
      case "assistants":
        return assistants
      case "files":
        return files
      case "tools":
        return tools
      default:
        return []
    }
  }

  return (
    <>
      {/* Hamburger menu for mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-2 top-2 z-50 md:hidden"
        onClick={() => handleCreateChat()}
      >
        <IconMessagePlus {...iconProps} className="text-foreground" />
      </Button>

      {/* Mobile overlay */}
      {showSidebar && (
        <div
          className="bg-background/80 fixed inset-0 z-40 backdrop-blur-sm md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "bg-background fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r transition-all duration-300 ease-in-out md:relative",
          isLoaded ? (isCollapsed ? "w-16" : "w-[300px]") : "w-[300px]",
          !isLoaded && "invisible",
          showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div
          className={cn(
            "flex border-b",
            isCollapsed
              ? "flex-col items-center py-2"
              : "items-center justify-between p-2"
          )}
        >
          <Button
            variant="ghost"
            size={"icon"}
            onClick={handleCreateChat}
            title="New Chat"
          >
            <IconMessagePlus {...iconProps} className="text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapseOrSubmenu}
            className="hidden md:flex"
          >
            {isCollapsed ? (
              <IconChevronRight {...iconProps} />
            ) : (
              <IconChevronLeft {...iconProps} />
            )}
          </Button>
        </div>

        <div className="flex grow flex-col overflow-y-auto">
          <div className="p-2">
            <SidebarItem
              icon={<IconPuzzle {...iconProps} />}
              label="Prompts"
              onClick={() => handleSubmenuOpen("prompts")}
              hasSubmenu
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              icon={<IconRobot {...iconProps} />}
              label="Assistants"
              onClick={() => handleSubmenuOpen("assistants")}
              hasSubmenu
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              icon={<IconFolder {...iconProps} />}
              label="Files"
              onClick={() => handleSubmenuOpen("files")}
              hasSubmenu
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              icon={<IconTool {...iconProps} />}
              label="Tools"
              onClick={() => handleSubmenuOpen("tools")}
              hasSubmenu
              isCollapsed={isCollapsed}
            />
          </div>

          {!isCollapsed && (
            <div className="flex grow flex-col border-t">
              <div className="flex grow flex-col p-2">
                <SearchInput
                  placeholder="Search chats"
                  value={searchQueries.chats}
                  onChange={value =>
                    setSearchQueries(prev => ({ ...prev, chats: value }))
                  }
                />
                <SidebarDataList
                  contentType="chats"
                  data={chats}
                  folders={folders.filter(folder => folder.type === "chats")}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-2">
          <ProfileSettings isCollapsed={isCollapsed} />
        </div>

        {(["prompts", "assistants", "files", "tools"] as const).map(
          contentType => (
            <SlidingSubmenu
              key={contentType}
              isOpen={activeSubmenu === contentType}
            >
              <div className="mb-2 flex items-center justify-between space-x-2">
                <SearchInput
                  className="w-full"
                  placeholder={`Search ${contentType}`}
                  value={searchQueries[contentType]}
                  onChange={value =>
                    setSearchQueries(prev => ({
                      ...prev,
                      [contentType]: value
                    }))
                  }
                />
                <SidebarCreateButtons
                  contentType={contentType}
                  hasData={getDataForContentType(contentType).length > 0}
                />
              </div>
              <SidebarDataList
                contentType={contentType}
                data={getDataForContentType(contentType)}
                folders={folders.filter(folder => folder.type === contentType)}
              />
            </SlidingSubmenu>
          )
        )}
      </div>
    </>
  )
}
