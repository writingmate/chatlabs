import {
  FC,
  useState,
  useContext,
  useRef,
  useEffect,
  useMemo,
  useCallback
} from "react"
import { motion } from "framer-motion"
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
  IconMessage2Plus,
  IconLayoutColumns,
  IconPuzzle2,
  IconBulb,
  IconLayoutSidebar
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
import Link from "next/link"
import { WithTooltip } from "../ui/with-tooltip"

export const Sidebar: FC = () => {
  const {
    chats,
    prompts,
    files,
    tools,
    assistants,
    folders,
    profile,
    showSidebar,
    setShowSidebar
  } = useContext(ChatbotUIContext)
  const { handleNewChat } = useChatHandler()
  const [activeSubmenu, setActiveSubmenu] = useState<ContentType | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const storedCollapsedState = localStorage.getItem("sidebarCollapsed")
    return storedCollapsedState === "true"
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const [searchQueries, setSearchQueries] = useState({
    chats: "",
    prompts: "",
    assistants: "",
    files: "",
    tools: ""
  })
  const [expandDelay, setExpandDelay] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleSubmenuOpen = (menuName: ContentType) => {
    if (isCollapsed) {
      setExpandDelay(true)
      setTimeout(() => {
        setIsCollapsed(false)
        setExpandDelay(false)
      }, 50)
    }
    setActiveSubmenu(menuName === activeSubmenu ? null : menuName)
  }

  const toggleCollapseOrSubmenu = () => {
    if (activeSubmenu) {
      setActiveSubmenu(null)
    } else {
      setIsCollapsed(!isCollapsed)
      try {
        localStorage.setItem("sidebarCollapsed", (!isCollapsed).toString())
      } catch (error) {
        console.error("Error setting sidebar collapsed state:", error)
      }
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

  const dataMap = useMemo(() => {
    return {
      chats: chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQueries.chats.toLowerCase())
      ),
      prompts: prompts.filter(prompt =>
        prompt.name.toLowerCase().includes(searchQueries.prompts.toLowerCase())
      ),
      assistants: assistants.filter(assistant =>
        assistant.name
          .toLowerCase()
          .includes(searchQueries.assistants.toLowerCase())
      ),
      files: files.filter(file =>
        file.name.toLowerCase().includes(searchQueries.files.toLowerCase())
      ),
      tools: tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQueries.tools.toLowerCase())
      )
    }
  }, [chats, prompts, assistants, files, tools, searchQueries])

  const foldersMap = useMemo(
    () => ({
      chats: folders.filter(folder => folder.type === "chats"),
      prompts: folders.filter(folder => folder.type === "prompts"),
      assistants: folders.filter(folder => folder.type === "assistants"),
      files: folders.filter(folder => folder.type === "files"),
      tools: folders.filter(folder => folder.type === "tools")
    }),
    [folders]
  )

  function getSubmenuTitle(contentType: ContentType) {
    switch (contentType) {
      case "prompts":
        return "Prompts"
      case "assistants":
        return "Assistants"
      case "files":
        return "Files"
      case "tools":
        return "Plugins"
      default:
        return ""
    }
  }

  const COLLAPSED_SIDEBAR_WIDTH = 58
  const EXPANDED_SIDEBAR_WIDTH = 300

  return useMemo(
    () => (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-2 top-2 z-50 md:hidden"
          onClick={() => {
            setShowSidebar(true)
            setIsCollapsed(false)
            setActiveSubmenu(null)
          }}
        >
          <IconLayoutSidebar {...iconProps} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-12 top-2 z-50 md:hidden"
          onClick={() => handleCreateChat()}
        >
          <IconMessagePlus {...iconProps} />
        </Button>

        {/* Mobile overlay */}
        {showSidebar && (
          <div
            className="bg-background/80 fixed inset-0 z-40 backdrop-blur-sm md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        <>{/* Sidebar */}</>
        <motion.div
          ref={sidebarRef}
          className={cn(
            "bg-background fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r md:relative",
            !isLoaded && "invisible",
            showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
          initial={{
            width: isCollapsed
              ? COLLAPSED_SIDEBAR_WIDTH
              : EXPANDED_SIDEBAR_WIDTH
          }}
          animate={{
            width: isCollapsed
              ? COLLAPSED_SIDEBAR_WIDTH
              : EXPANDED_SIDEBAR_WIDTH
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
            delay: expandDelay ? 0.15 : 0
          }}
        >
          <div
            className={cn(
              "flex items-start border-b p-2",
              isCollapsed ? "flex-col" : "justify-between"
            )}
          >
            <WithTooltip
              asChild
              display={<div>New Chat</div>}
              trigger={
                <Button
                  className="w-10 shrink-0"
                  variant="ghost"
                  size={"icon"}
                  onClick={handleCreateChat}
                  title="New Chat"
                >
                  <IconMessagePlus {...iconProps} />
                </Button>
              }
              side="right"
            />
            <div className="align-center flex h-full grow items-center justify-center">
              {activeSubmenu && getSubmenuTitle(activeSubmenu)}
            </div>
            <WithTooltip
              asChild
              display={<div>{isCollapsed ? "Expand" : "Collapse"}</div>}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapseOrSubmenu}
                  className="w-10"
                >
                  {isCollapsed ? (
                    <IconChevronRight {...iconProps} />
                  ) : (
                    <IconChevronLeft {...iconProps} />
                  )}
                </Button>
              }
              side="right"
            />
          </div>

          <div className="flex grow flex-col overflow-y-auto">
            <div className="p-2">
              <SidebarItem
                icon={<IconBulb {...iconProps} />}
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
                icon={<IconPuzzle {...iconProps} />}
                label="Plugins"
                onClick={() => handleSubmenuOpen("tools")}
                hasSubmenu
                isCollapsed={isCollapsed}
              />
              <Link href="/splitview" target="_blank" passHref>
                <SidebarItem
                  icon={<IconLayoutColumns {...iconProps} />}
                  label="Split view"
                  onClick={() => {}} // This onClick is now optional
                  isCollapsed={isCollapsed}
                />
              </Link>
              {/*<Link href="/applications" passHref>*/}
              {/*  <SidebarItem*/}
              {/*    icon={<IconApps {...iconProps} />}*/}
              {/*    label="Applications"*/}
              {/*    onClick={() => {}} // This onClick is now optional*/}
              {/*    isCollapsed={isCollapsed}*/}
              {/*  />*/}
              {/*</Link>*/}
            </div>

            {(searchQueries.chats || dataMap.chats.length > 0) && (
              <div
                className={cn(
                  "flex grow flex-col border-t",
                  isCollapsed ? "hidden" : ""
                )}
              >
                <div className="flex grow flex-col p-2 pb-0">
                  <SearchInput
                    placeholder="Search chats"
                    value={searchQueries.chats}
                    onChange={value =>
                      setSearchQueries(prev => ({ ...prev, chats: value }))
                    }
                  />
                  <SidebarDataList
                    contentType="chats"
                    data={dataMap.chats}
                    folders={foldersMap.chats}
                  />
                </div>
              </div>
            )}
          </div>

          {profile && (
            <div className="border-t p-2">
              <ProfileSettings isCollapsed={isCollapsed} />
            </div>
          )}

          {!isCollapsed &&
            (["prompts", "assistants", "files", "tools"] as const).map(
              contentType => (
                <SlidingSubmenu
                  key={contentType}
                  isOpen={activeSubmenu === contentType}
                  contentType={contentType}
                  isCollapsed={isCollapsed}
                >
                  <>
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
                        hasData={dataMap[contentType].length > 0}
                      />
                    </div>
                    <SidebarDataList
                      contentType={contentType}
                      data={dataMap[contentType]}
                      folders={foldersMap[contentType]}
                    />
                  </>
                </SlidingSubmenu>
              )
            )}
        </motion.div>
      </>
    ),
    [
      activeSubmenu,
      chats,
      prompts,
      assistants,
      files,
      tools,
      folders,
      isCollapsed,
      isLoaded,
      showSidebar,
      searchQueries
    ]
  )
}
