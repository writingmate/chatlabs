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
  IconPuzzle,
  IconFolder,
  IconChevronRight,
  IconChevronLeft,
  IconMessagePlus,
  IconRobot,
  IconLayoutColumns,
  IconBulb,
  IconLayoutSidebar,
  IconSparkles,
  IconApps
} from "@tabler/icons-react"
import { ChatbotUIContext } from "@/context/context"
import { Button } from "../ui/button"
import { cn, onlyUniqueById } from "@/lib/utils"
import { SIDEBAR_ITEM_ICON_SIZE } from "@/components/sidebar/items/all/sidebar-display-item"
import { SearchInput } from "../ui/search-input"
import { ProfileSettings } from "../utility/profile-settings"
import { useChatHandler } from "../chat/chat-hooks/use-chat-handler"
import { SidebarDataList } from "./sidebar-data-list"
import { ContentType } from "@/types"
import Link from "next/link"
import { WithTooltip } from "../ui/with-tooltip"
import { searchChatsByName } from "@/db/chats"
import { debounce } from "@/lib/debounce"
import { Tables } from "@/supabase/types"
import { useFeatureFlag } from "@/lib/amplitude"

export const Sidebar: FC = () => {
  const {
    prompts,
    files,
    tools,
    assistants,
    folders,
    profile,
    selectedWorkspace,
    effectivePlan,
    showSidebar,
    setShowSidebar,
    isPaywallOpen,
    chats,
    setChats,
    setIsPaywallOpen // Use context's state
  } = useContext(ChatbotUIContext)
  const { handleNewChat } = useChatHandler()
  const [activeSubmenu, setActiveSubmenu] = useState<ContentType | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const storedCollapsedState = localStorage.getItem("sidebarCollapsed")
    return storedCollapsedState === "true"
  })

  const { flagValue: appsEnabled } = useFeatureFlag("apps_enabled", false)
  const [isLoaded, setIsLoaded] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const [searchQueries, setSearchQueries] = useState<{
    chats: string
    prompts: string
    assistants: string
    files: string
    tools: string
  }>({
    chats: "",
    prompts: "",
    assistants: "",
    files: "",
    tools: ""
  })

  const [expandDelay, setExpandDelay] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const [chatOffset, setChatOffset] = useState(0)

  const [reachedEnd, setReachedEnd] = useState(false)

  const loadMoreChats = useCallback(async () => {
    if (searchLoading) return
    if (reachedEnd) return
    const lastChatCreatedAt = chats?.[chats.length - 1]?.created_at
    handleSearchChange(searchQueries.chats, chatOffset + 40, lastChatCreatedAt)
  }, [searchQueries.chats, chatOffset, chats, reachedEnd, searchLoading])

  const handleSearchChange = useCallback(
    debounce(async (query: string, offset: number, lastCreatedAt?: string) => {
      if (!selectedWorkspace) return
      setSearchLoading(true)
      const newChats = await searchChatsByName(
        selectedWorkspace.id,
        query,
        lastCreatedAt,
        offset,
        40
      )
      if (offset === 0) {
        setChats(newChats)
      } else {
        setChats(prevChats =>
          [...prevChats, ...newChats].filter(onlyUniqueById)
        )
      }
      setChatOffset(offset) // Update offset for pagination
      setSearchLoading(false)
      setReachedEnd(newChats.length < 40)
    }, 300), // Debounce delay of 300ms
    [selectedWorkspace, reachedEnd]
  )

  useEffect(() => {
    handleSearchChange(searchQueries.chats, 0)
  }, [searchQueries.chats])

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

  const dataMap = useMemo(
    () => ({
      chats,
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
    }),
    [prompts, assistants, files, tools, searchQueries, chats]
  )

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

  const handleUpgrade = () => {
    setIsPaywallOpen(true)
  }

  return useMemo(
    () => (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-2 top-2 z-30 md:hidden"
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
          className="fixed left-12 top-2 z-30 md:hidden"
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

        {/* Sidebar */}
        <motion.div
          ref={sidebarRef}
          className={cn(
            "bg-background fixed inset-y-0 left-0 z-30 flex h-full flex-col border-r md:relative", // Removed inset-y-0
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
              "flex border-b p-2",
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
            {!isCollapsed && (
              <div className="align-center flex items-center justify-center">
                {activeSubmenu && getSubmenuTitle(activeSubmenu)}
              </div>
            )}
            <WithTooltip
              asChild
              display={<div>{isCollapsed ? "Expand" : "Collapse"}</div>}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapseOrSubmenu}
                  className="hidden w-10 shrink-0 md:flex"
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
              <Link href="/splitview" target="_blank" passHref>
                <SidebarItem
                  icon={<IconLayoutColumns {...iconProps} />}
                  label="Split view"
                  onClick={() => {}} // This onClick is now optional
                  isCollapsed={isCollapsed}
                />
              </Link>
              {appsEnabled && (
                <Link href="/applications" passHref>
                  <SidebarItem
                    icon={<IconApps {...iconProps} />}
                    label="Applications"
                    onClick={() => {}} // This onClick is now optional
                    isCollapsed={isCollapsed}
                  />
                </Link>
              )}
            </div>

            <div
              className={cn(
                "flex grow flex-col border-t",
                isCollapsed ? "hidden" : ""
              )}
            >
              <div className="flex grow flex-col p-2 pb-0">
                <SearchInput
                  placeholder="Search chats..."
                  value={searchQueries.chats}
                  loading={searchLoading}
                  onChange={e =>
                    setSearchQueries({ ...searchQueries, chats: e })
                  }
                />
                <SidebarDataList
                  contentType="chats"
                  data={dataMap.chats}
                  folders={foldersMap.chats}
                  onLoadMore={loadMoreChats} // Pass loadMoreChats only for chats
                />
              </div>
            </div>
          </div>

          {/* Upgrade message for free plan users */}
          {effectivePlan === "free" && (
            <div className="border-t p-2">
              <div className="flex flex-col items-center justify-between space-y-2 text-sm">
                {!isCollapsed && (
                  <div className="font-semibold">Upgrade to Pro</div>
                )}
                {!isCollapsed && (
                  <div className="text-muted-foreground text-center text-xs">
                    Upgrade to get access to all models, assistants, plugins and
                    more.
                  </div>
                )}
                <Button
                  variant="default"
                  size={isCollapsed ? "icon" : "sm"}
                  className="rounded-full bg-violet-700"
                  onClick={handleUpgrade}
                >
                  <IconSparkles
                    {...iconProps}
                    className="text-white"
                    stroke={1.5}
                  />
                  {!isCollapsed && <span className="ml-2">Upgrade</span>}
                </Button>
              </div>
            </div>
          )}

          {profile && (
            <div className="border-t">
              <ProfileSettings isCollapsed={isCollapsed} />
            </div>
          )}

          {!isCollapsed &&
            (["prompts", "assistants", "files"] as const).map(contentType => (
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
                      onChange={e =>
                        setSearchQueries({
                          ...searchQueries,
                          [contentType]: e
                        })
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
            ))}
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
      searchQueries,
      profile,
      selectedWorkspace,
      effectivePlan,
      isPaywallOpen, // Use context's state
      loadMoreChats, // Add loadMoreChats to dependencies
      searchLoading // Add searchLoading to dependencies
    ]
  )
}
