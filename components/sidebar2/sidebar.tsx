import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { ContentType } from "@/types"
import { FC, useContext, useState } from "react"
import { SIDEBAR_WIDTH } from "../ui/dashboard"
import { TabsContent } from "../ui/tabs"
import { WorkspaceSwitcher } from "../utility/workspace-switcher"
import { WorkspaceSettings } from "../workspace/workspace-settings"
import { SidebarContent } from "./sidebar-content"
import { validateProPlan } from "@/lib/subscription"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { IconDiamondFilled } from "@tabler/icons-react"
import { ProfileSettings } from "@/components/utility/profile-settings"
import { SIDEBAR_ICON_SIZE } from "@/components/sidebar2/sidebar-switcher"
import { SidebarTopContent } from "@/components/sidebar2/sidebar-top-content"
import { SidebarDataList } from "@/components/sidebar2/sidebar-data-list"
import { SidebarDialog } from "@/components/sidebar2/sidebar-dialog"

interface SidebarProps {
  contentType: ContentType
  onContentTypeChange: (contentType: ContentType) => void
  showSidebar: boolean
}

export const Sidebar2: FC<SidebarProps> = ({
  contentType,
  onContentTypeChange,
  showSidebar
}) => {
  const {
    folders,
    chats,
    presets,
    prompts,
    files,
    collections,
    assistants,
    tools,
    models,
    profile,
    setIsPaywallOpen,
    workspaces
  } = useContext(ChatbotUIContext)

  const [searchTerm, setSearchTerm] = useState("")

  const chatFolders = folders.filter(folder => folder.type === "chats")
  const presetFolders = folders.filter(folder => folder.type === "presets")
  const promptFolders = folders.filter(folder => folder.type === "prompts")
  const filesFolders = folders.filter(folder => folder.type === "files")
  const collectionFolders = folders.filter(
    folder => folder.type === "collections"
  )
  const assistantFolders = folders.filter(
    folder => folder.type === "assistants"
  )
  const toolFolders = folders.filter(folder => folder.type === "tools")
  const modelFolders = folders.filter(folder => folder.type === "models")

  const filteredChats = chats.filter(
    chat => chat.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
  )
  return (
    <div
      className="m-0 w-full space-y-2"
      style={
        {
          // Sidebar - SidebarSwitcher
          // minWidth: showSidebar ? `calc(${SIDEBAR_WIDTH}px - 60px)` : "0px",
          // maxWidth: showSidebar ? `calc(${SIDEBAR_WIDTH}px - 60px)` : "0px",
          // width: showSidebar ? `calc(${SIDEBAR_WIDTH}px - 60px)` : "0px"
        }
      }
      // value={contentType}
    >
      <div className="flex h-screen flex-col p-3 pb-2">
        {workspaces?.length > 1 && (
          <div className="flex items-center border-b pb-2">
            <WorkspaceSwitcher />
            <WorkspaceSettings />
          </div>
        )}
        <div className="flex max-h-full grow flex-col overflow-auto">
          <SidebarTopContent
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            contentType={contentType}
            onContentTypeChange={onContentTypeChange}
          />
          <SidebarDataList
            contentType={"chats"}
            data={filteredChats}
            folders={folders}
          />
        </div>

        <div className="flex w-full flex-col space-y-2">
          {!validateProPlan(profile) && (
            <div
              onClick={() => setIsPaywallOpen(true)}
              className={"hover:bg-accent/60 cursor-pointer rounded-md p-2"}
            >
              <div
                className={
                  "text-md flex items-center font-semibold text-violet-700"
                }
              >
                <IconDiamondFilled
                  className="mr-2 cursor-pointer"
                  stroke={1.5}
                  size={24}
                />{" "}
                Try Pro
              </div>
              <div className={"text-muted-foreground text-sm"}>
                Upgrade to paid plan to get access to all features.
              </div>
            </div>
          )}

          <WithTooltip
            display={<div>Profile Settings</div>}
            trigger={<ProfileSettings />}
          />
        </div>
      </div>
    </div>
  )
}
