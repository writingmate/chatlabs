"use client"

import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ChatbotUIContext } from "@/context/context"
import { createWorkspace } from "@/db/workspaces"
import useHotkey from "@/lib/hooks/use-hotkey"
import { IconBuilding, IconHome, IconPlus } from "@tabler/icons-react"
import { ChevronsUpDown } from "lucide-react"
import Image from "next/image"
import { useRouter } from "nextjs-toploader/app"
import { FC, useContext, useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { SIDEBAR_ITEM_ICON_SIZE } from "../sidebar/items/all/sidebar-display-item"
import { SIDEBAR_ICON_STROKE } from "../sidebar/sidebar-switcher"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { setWorkspaceIdCookie } from "@/actions/workspace"

interface WorkspaceSwitcherProps {}

export const WorkspaceSwitcher: FC<WorkspaceSwitcherProps> = ({}) => {
  useHotkey(";", () => setOpen(prevState => !prevState))

  const {
    profile,
    workspaces,
    workspaceImages,
    selectedWorkspace,
    setSelectedWorkspace,
    setWorkspaces
  } = useContext(ChatbotUIContext)

  const { handleNewChat } = useChatHandler()

  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!selectedWorkspace) return

    setValue(selectedWorkspace.id)
  }, [selectedWorkspace])

  const handleCreateWorkspace = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()

    if (!selectedWorkspace) return

    const createdWorkspace = await createWorkspace({
      user_id: selectedWorkspace.user_id,
      default_context_length: selectedWorkspace.default_context_length,
      default_model: selectedWorkspace.default_model,
      default_prompt: selectedWorkspace.default_prompt,
      default_temperature: selectedWorkspace.default_temperature,
      description: "",
      embeddings_provider: "openai",
      include_profile_context: selectedWorkspace.include_profile_context,
      include_workspace_instructions:
        selectedWorkspace.include_workspace_instructions,
      instructions: selectedWorkspace.instructions,
      is_home: false,
      name: "New Workspace"
    })

    setWorkspaces([...workspaces, createdWorkspace])
    setSelectedWorkspace(createdWorkspace)
    setOpen(false)

    return router.push(`/chat`)
  }

  const getWorkspaceImage = (workspaceId: string) => {
    const workspace = workspaces.find(workspace => workspace.id === workspaceId)

    if (!workspace) return

    return workspaceImages.find(image => image.workspaceId === workspace.id)
      ?.url
  }

  const getWorkspaceName = (workspaceId: string) => {
    const workspace = workspaces.find(workspace => workspace.id === workspaceId)

    if (!workspace) return

    return workspace.name === "Home"
      ? profile?.user_id === workspace.user_id
        ? "My ChatLabs"
        : `${profile?.display_name || profile?.username}'s ChatLabs`
      : workspace.name
  }

  const handleSelect = (workspaceId: string) => {
    const workspace = workspaces.find(workspace => workspace.id === workspaceId)

    if (!workspace) return

    setSelectedWorkspace(workspace)
    setOpen(false)
    setWorkspaceIdCookie(workspace.id)
    return router.push(`/chat`)
  }

  const workspaceImage = workspaceImages.find(
    image => image.workspaceId === selectedWorkspace?.id
  )
  const imageSrc = workspaceImage
    ? workspaceImage.url
    : selectedWorkspace?.is_home
      ? ""
      : ""

  const workspaceName = getWorkspaceName(value)

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="px-1">
        <div className="flex items-center truncate">
          {selectedWorkspace && (
            <div className="flex items-center">
              <Avatar
                style={{ width: "24px", height: "24px" }}
                className="mr-2"
              >
                <AvatarImage
                  src={getWorkspaceImage(selectedWorkspace.id)}
                  alt={workspaceName}
                />
                <AvatarFallback>
                  {workspaceName?.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          {getWorkspaceName(value) || "Select workspace..."}
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {workspaces.map(workspace => {
          return (
            <DropdownMenuItem
              key={workspace.id}
              className={cn("cursor-pointer", {
                "bg-accent": selectedWorkspace?.id === workspace.id
              })}
              onSelect={() => handleSelect(workspace.id)}
            >
              <Avatar
                style={{ width: "24px", height: "24px" }}
                className="mr-2"
              >
                <AvatarImage
                  src={getWorkspaceImage(workspace.id)}
                  alt={getWorkspaceName(workspace.id)}
                />
                <AvatarFallback>
                  {getWorkspaceName(workspace.id)?.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {getWorkspaceName(workspace.id)}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuItem
          className="flex w-full items-center space-x-2"
          onClick={handleCreateWorkspace}
        >
          <IconPlus
            className="text-muted-foreground mr-2"
            size={SIDEBAR_ITEM_ICON_SIZE}
            stroke={SIDEBAR_ICON_STROKE}
          />
          New Workspace
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
