import { ChatbotUIContext } from "@/context/context"
import { PROFILE_CONTEXT_MAX, PROFILE_DISPLAY_NAME_MAX } from "@/db/limits"
import { updateProfile } from "@/db/profile"
import { uploadProfileImage } from "@/db/storage/profile-images"
import { exportLocalStorageAsJSON } from "@/lib/export-old-data"
import { fetchOpenRouterModels } from "@/lib/models/fetch-models"
import { LLM_LIST_MAP } from "@/lib/models/llm/llm-list"
import { supabase } from "@/lib/supabase/browser-client"
import { cn } from "@/lib/utils"
import { OpenRouterLLM } from "@/types"
import {
  IconExternalLink,
  IconFileDownload,
  IconInfoCircle,
  IconKey,
  IconLogout,
  IconSettings,
  IconTrash,
  IconUser,
  IconPuzzle,
  IconMenu,
  IconX,
  IconSend
} from "@tabler/icons-react"
import Image from "next/image"
import { useRouter, redirect } from "next/navigation"
import { FC, useCallback, useContext, useRef, useState, useEffect } from "react"
import { toast } from "sonner"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"
import { Button } from "../ui/button"
import ImagePicker from "../ui/image-picker"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { LimitDisplay } from "../ui/limit-display"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { WithTooltip } from "../ui/with-tooltip"
import { ThemeSwitcher } from "./theme-switcher"
import {
  createBillingPortalSession,
  redirectToBillingPortal
} from "@/actions/stripe"
import { PLAN_FREE, PLAN_PRO, PLAN_ULTIMATE } from "@/lib/stripe/config"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { debounce } from "@/lib/debounce"
import { Callout, CalloutDescription, CalloutTitle } from "../ui/callout"
import { Loader } from "lucide-react"
import { ButtonWithTooltip } from "../ui/button-with-tooltip"
import {
  getWorkspaceUsers,
  removeWorkspaceUser,
  updateWorkspaceUserRole
} from "@/db/workspaces"
import { DialogDescription } from "@radix-ui/react-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select"
import { getWorkspaces } from "@/db/workspaces"
import { Tables } from "@/supabase/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../ui/table"
import { useAuth } from "@/context/auth"
import { SidebarCreateButtons } from "../sidebar/sidebar-create-buttons"
import { SidebarDataList } from "../sidebar/sidebar-data-list"
import { SearchInput } from "../ui/search-input"
import { ToolManager } from "./ToolManager"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Menu } from "lucide-react"
import { SIDEBAR_ITEM_ICON_SIZE } from "../sidebar/items/all/sidebar-display-item"
import { WorkspaceSwitcher } from "./workspace-switcher"
import { WorkspaceSettings } from "../workspace/workspace-settings"
import { uploadWorkspaceImage } from "@/db/storage/workspace-images"
import { getWorkspaceImageFromStorage } from "@/db/storage/workspace-images"
import { updateWorkspace } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { deleteWorkspace } from "@/db/workspaces"
import { getWorkspaceByStripeCustomerId } from "@/db/workspaces"

interface ProfileSettingsProps {
  isCollapsed: boolean
}

// Add this near the top of the file
const getPlanDisplay = (
  profile: Tables<"profiles">,
  workspace: Tables<"workspaces"> | null
) => {
  if (profile.workspace_migration_enabled && workspace?.plan) {
    return workspace.plan.split("_")[0]
  }
  return profile.plan.split("_")[0]
}

export const ProfileSettings: FC<ProfileSettingsProps> = ({ isCollapsed }) => {
  const {
    profile,
    setProfile,
    envKeyMap,
    setAvailableHostedModels,
    setAvailableOpenRouterModels,
    availableOpenRouterModels,
    setIsPaywallOpen,
    isProfileSettingsOpen,
    setIsProfileSettingsOpen,
    tools,
    folders,
    selectedWorkspace,
    setSelectedWorkspace,
    workspaceImages,
    setWorkspaceImages
  } = useContext(ChatbotUIContext)

  const [loadingBillingPortal, setLoadingBillingPortal] = useState(false)

  const router = useRouter()

  const { user: currentUser } = useAuth()

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [username, setUsername] = useState(profile?.username || "")
  const [usernameAvailable, setUsernameAvailable] = useState(true)
  const [loadingUsername, setLoadingUsername] = useState(false)
  const [experimentalCodeEditor, setExperimentalCodeEditor] = useState(
    profile?.experimental_code_editor || false
  )
  const [profileImageSrc, setProfileImageSrc] = useState(
    profile?.image_url || ""
  )
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileInstructions, setProfileInstructions] = useState(
    profile?.profile_context || ""
  )

  const [useAzureOpenai, setUseAzureOpenai] = useState(
    profile?.use_azure_openai
  )
  const [openaiAPIKey, setOpenaiAPIKey] = useState(
    profile?.openai_api_key || ""
  )
  const [openaiOrgID, setOpenaiOrgID] = useState(
    profile?.openai_organization_id || ""
  )
  const [azureOpenaiAPIKey, setAzureOpenaiAPIKey] = useState(
    profile?.azure_openai_api_key || ""
  )
  const [azureOpenaiEndpoint, setAzureOpenaiEndpoint] = useState(
    profile?.azure_openai_endpoint || ""
  )
  const [azureOpenai35TurboID, setAzureOpenai35TurboID] = useState(
    profile?.azure_openai_35_turbo_id || ""
  )
  const [azureOpenai45TurboID, setAzureOpenai45TurboID] = useState(
    profile?.azure_openai_45_turbo_id || ""
  )
  const [azureOpenai45VisionID, setAzureOpenai45VisionID] = useState(
    profile?.azure_openai_45_vision_id || ""
  )
  const [azureEmbeddingsID, setAzureEmbeddingsID] = useState(
    profile?.azure_openai_embeddings_id || ""
  )
  const [anthropicAPIKey, setAnthropicAPIKey] = useState(
    profile?.anthropic_api_key || ""
  )
  const [googleGeminiAPIKey, setGoogleGeminiAPIKey] = useState(
    profile?.google_gemini_api_key || ""
  )
  const [mistralAPIKey, setMistralAPIKey] = useState(
    profile?.mistral_api_key || ""
  )
  const [groqAPIKey, setGroqAPIKey] = useState(profile?.groq_api_key || "")
  const [perplexityAPIKey, setPerplexityAPIKey] = useState(
    profile?.perplexity_api_key || ""
  )

  const [openrouterAPIKey, setOpenrouterAPIKey] = useState(
    profile?.openrouter_api_key || ""
  )

  const [toolsCommand, setToolsCommand] = useState(
    profile?.tools_command || "!"
  )

  const [assistantCommand, setAssistantCommand] = useState(
    profile?.assistant_command || "@"
  )

  const [filesCommand, setFilesCommand] = useState(
    profile?.files_command || "#"
  )

  const [promptCommand, setPromptCommand] = useState(
    profile?.prompt_command || "/"
  )

  const [sendMessageOnEnter, setSendMessageOnEnter] = useState<boolean>(
    profile?.send_message_on_enter || true
  )

  const [workspaces, setWorkspaces] = useState<Tables<"workspaces">[]>([])
  const [workspaceUsers, setWorkspaceUsers] = useState<
    Tables<"workspace_users">[]
  >([])
  const [inviteEmail, setInviteEmail] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [showPlugins, setShowPlugins] = useState(true)

  const [workspaceName, setWorkspaceName] = useState(
    selectedWorkspace?.name || ""
  )
  const [workspaceImageLink, setWorkspaceImageLink] = useState("")
  const [workspaceSelectedImage, setWorkspaceSelectedImage] =
    useState<File | null>(null)

  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false)

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toolsFolders = folders.filter(folder => folder.type === "tools")

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const fetchedWorkspaces = await getWorkspaces()
        setWorkspaces(fetchedWorkspaces)
      } catch (error) {
        console.error("Error fetching workspaces:", error)
        toast.error("Failed to fetch workspaces")
      }
    }

    fetchWorkspaces()
  }, [])

  useEffect(() => {
    if (selectedWorkspace) {
      fetchWorkspaceUsers(selectedWorkspace.id)
    }
  }, [selectedWorkspace])

  useEffect(() => {
    if (selectedWorkspace) {
      setWorkspaceName(selectedWorkspace.name)
      const workspaceImage =
        workspaceImages.find(
          image => image.path === selectedWorkspace.image_path
        )?.base64 || ""
      setWorkspaceImageLink(workspaceImage)
    }
  }, [selectedWorkspace, workspaceImages])

  const fetchWorkspaceUsers = async (workspaceId: string) => {
    try {
      const users = await getWorkspaceUsers(workspaceId)
      setWorkspaceUsers(users)
    } catch (error) {
      console.error("Error fetching workspace users:", error)
      toast.error("Failed to fetch workspace users")
    }
  }

  const handleInviteUser = async (inviteEmail: string) => {
    if (!selectedWorkspace || !inviteEmail) {
      toast.error("Please select a workspace and enter an email address")
      return
    }

    try {
      const response = await fetch("/api/workspaces/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspace.id,
          email: inviteEmail
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to invite user")
      }

      const data = await response.json()
      toast.success(data.message)
      setInviteEmail("")
      fetchWorkspaceUsers(selectedWorkspace.id)
    } catch (error: any) {
      toast.error(error.message || "An error occurred while inviting the user")
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
    return
  }

  const handleSaveProfile = async () => {
    if (!profile) return
    let profileImageUrl = profile.image_url
    let profileImagePath = ""

    if (profileImageFile) {
      const { path, url } = await uploadProfileImage(profile, profileImageFile)
      profileImageUrl = url ?? profileImageUrl
      profileImagePath = path
    }

    const updatedProfile = await updateProfile(profile.id, {
      ...profile,
      display_name: displayName,
      username,
      profile_context: profileInstructions,
      image_url: profileImageUrl,
      image_path: profileImagePath,
      experimental_code_editor: experimentalCodeEditor
    })

    setProfile(updatedProfile)

    toast.success("Profile updated!")
  }

  const handleSaveShortcuts = async () => {
    // Update profile with shortcuts-related fields
    if (!profile) return
    const updatedProfile = await updateProfile(profile.id, {
      tools_command: toolsCommand,
      assistant_command: assistantCommand,
      files_command: filesCommand,
      prompt_command: promptCommand,
      send_message_on_enter: sendMessageOnEnter
    })
    setProfile(updatedProfile)
    toast.success("Shortcuts updated!")
  }

  const handleSaveAPIKeys = async () => {
    if (!profile) return
    const updatedProfile = await updateProfile(profile.id, {
      openai_api_key: openaiAPIKey,
      openai_organization_id: openaiOrgID,
      anthropic_api_key: anthropicAPIKey,
      google_gemini_api_key: googleGeminiAPIKey,
      mistral_api_key: mistralAPIKey,
      groq_api_key: groqAPIKey,
      perplexity_api_key: perplexityAPIKey,
      use_azure_openai: useAzureOpenai,
      azure_openai_api_key: azureOpenaiAPIKey,
      azure_openai_endpoint: azureOpenaiEndpoint,
      azure_openai_35_turbo_id: azureOpenai35TurboID,
      azure_openai_45_turbo_id: azureOpenai45TurboID,
      azure_openai_45_vision_id: azureOpenai45VisionID,
      azure_openai_embeddings_id: azureEmbeddingsID,
      openrouter_api_key: openrouterAPIKey
    })
    setProfile(updatedProfile)

    const providers = [
      "openai",
      "google",
      "azure",
      "anthropic",
      "mistral",
      "groq",
      "perplexity",
      "openrouter"
    ]

    providers.forEach(async provider => {
      let providerKey: keyof typeof updatedProfile

      if (provider === "google") {
        providerKey = "google_gemini_api_key"
      } else if (provider === "azure") {
        providerKey = "azure_openai_api_key"
      } else {
        providerKey = `${provider}_api_key` as keyof typeof updatedProfile
      }

      const models = LLM_LIST_MAP[provider]
      const envKeyActive = envKeyMap[provider]

      if (!envKeyActive) {
        const hasApiKey = !!updatedProfile[providerKey]

        if (provider === "openrouter") {
          if (hasApiKey && availableOpenRouterModels.length === 0) {
            const openrouterModels: OpenRouterLLM[] =
              await fetchOpenRouterModels()
            setAvailableOpenRouterModels(prev => {
              const newModels = openrouterModels.filter(
                model =>
                  !prev.some(prevModel => prevModel.modelId === model.modelId)
              )
              return [...prev, ...newModels]
            })
          } else if (!hasApiKey) {
            setAvailableOpenRouterModels([])
          }
        } else {
          if (hasApiKey && Array.isArray(models)) {
            setAvailableHostedModels(prev => {
              const newModels = models.filter(
                model =>
                  !prev.some(prevModel => prevModel.modelId === model.modelId)
              )
              return [...prev, ...newModels]
            })
          } else if (!hasApiKey && Array.isArray(models)) {
            setAvailableHostedModels(prev =>
              prev.filter(model => !models.includes(model))
            )
          }
        }
      }
    })

    toast.success("API Keys updated!")
  }

  const handleSaveWorkspace = async () => {
    if (!selectedWorkspace) return

    let imagePath = selectedWorkspace.image_path

    if (workspaceSelectedImage) {
      imagePath = await uploadWorkspaceImage(
        selectedWorkspace,
        workspaceSelectedImage
      )

      const url = (await getWorkspaceImageFromStorage(imagePath)) || ""

      if (url) {
        const response = await fetch(url)
        const blob = await response.blob()
        const base64 = await convertBlobToBase64(blob)

        setWorkspaceImages(prev => [
          ...prev,
          {
            workspaceId: selectedWorkspace.id,
            path: imagePath,
            base64,
            url
          }
        ])
      }
    }

    const updatedWorkspace = await updateWorkspace(selectedWorkspace.id, {
      name: workspaceName,
      image_path: imagePath
    })

    setSelectedWorkspace(updatedWorkspace)
    setWorkspaces(workspaces => {
      return workspaces.map(workspace => {
        if (workspace.id === selectedWorkspace.id) {
          return updatedWorkspace
        }
        return workspace
      })
    })

    toast.success("Workspace updated!")
  }

  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspace) return

    // Check if this is the last workspace
    if (workspaces.length <= 1) {
      toast.error("You cannot delete your last workspace.")
      return
    }

    const confirmDelete = confirm(
      "Are you sure you want to delete this workspace? This action cannot be undone."
    )
    if (!confirmDelete) return

    setIsDeletingWorkspace(true)

    try {
      await deleteWorkspace(selectedWorkspace.id)
      toast.success("Workspace deleted successfully")

      // Remove the deleted workspace from the list
      const updatedWorkspaces = workspaces.filter(
        w => w.id !== selectedWorkspace.id
      )
      setWorkspaces(updatedWorkspaces)

      // Select the first available workspace
      const nextWorkspace = updatedWorkspaces[0]
      setSelectedWorkspace(nextWorkspace)

      setIsProfileSettingsOpen("")
    } catch (error) {
      console.error("Error deleting workspace:", error)
      toast.error("Failed to delete workspace")
    } finally {
      setIsDeletingWorkspace(false)
    }
  }

  function resetToDefaults() {
    setFilesCommand("#")
    setAssistantCommand("@")
    setPromptCommand("/")
    setToolsCommand("!")
    setSendMessageOnEnter(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      buttonRef.current?.click()
    }
  }

  const handleRedirectToBillingPortal = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingBillingPortal(true)
    try {
      if (!profile) {
        throw new Error("No profile found")
      }

      if (profile.workspace_migration_enabled) {
        if (!selectedWorkspace) {
          throw new Error("No workspace selected")
        }
        await redirectToBillingPortal(selectedWorkspace.id)
      } else {
        // Legacy billing portal redirect - pass empty string to indicate legacy mode
        await redirectToBillingPortal("")
      }
    } catch (error) {
      toast.error("Failed to redirect to billing portal")
    } finally {
      setLoadingBillingPortal(false)
    }
  }

  const handleRoleChange = async (
    user: Tables<"workspace_users">,
    newRole: string
  ) => {
    try {
      if (!selectedWorkspace) {
        toast.error("No workspace selected")
        return
      }
      await updateWorkspaceUserRole(
        selectedWorkspace.id,
        user.user_id,
        newRole as "OWNER" | "MEMBER"
      )
      setWorkspaceUsers(prevUsers =>
        prevUsers.map(u =>
          u.user_id === user.user_id
            ? { ...u, role: newRole as "OWNER" | "MEMBER" }
            : u
        )
      )
      toast.success(`Updated ${user.email}'s role to ${newRole}`)
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role")
    }
  }

  const handleRemoveUser = async (user: Tables<"workspace_users">) => {
    if (
      confirm(
        `Are you sure you want to remove ${user.email} from this workspace?`
      )
    ) {
      try {
        // Implement the removeWorkspaceUser function in your DB operations
        if (!selectedWorkspace) {
          toast.error("No workspace selected")
          return
        }
        await removeWorkspaceUser(selectedWorkspace.id, user.user_id)
        setWorkspaceUsers(prevUsers =>
          prevUsers.filter(u => u.user_id !== user.user_id)
        )
        toast.success(`Removed ${user.email} from the workspace`)
      } catch (error) {
        console.error("Error removing user from workspace:", error)
        toast.error("Failed to remove user from workspace")
      }
    }
  }

  if (!profile) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex h-auto w-full items-center justify-start space-x-2 rounded-none p-2 px-3 text-sm"
            )}
          >
            <Avatar className="size-8">
              <AvatarImage src={profile.image_url!} />
              <AvatarFallback>
                <IconUser size={SIDEBAR_ICON_SIZE} />
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex w-full items-center justify-between">
                <div>{profile.display_name}</div>
                <IconMenu
                  stroke={1.5}
                  size={18}
                  className="text-muted-foreground"
                />
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mb-1 w-[290px] cursor-pointer text-sm">
          {profile.workspace_migration_enabled && (
            <>
              <WorkspaceSwitcher />
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={() => setIsProfileSettingsOpen("profile")}
            className="px-1"
          >
            <IconSettings
              size={SIDEBAR_ITEM_ICON_SIZE}
              stroke={1.5}
              className="text-muted-foreground mr-2 text-sm"
            />
            Settings
          </DropdownMenuItem>
          <ThemeSwitcher />
          <DropdownMenuItem onClick={exportLocalStorageAsJSON} className="px-1">
            <IconFileDownload
              size={SIDEBAR_ITEM_ICON_SIZE}
              stroke={1.5}
              className="text-muted-foreground mr-2 text-sm"
            />
            Export Data
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="px-1">
            <IconLogout
              size={SIDEBAR_ITEM_ICON_SIZE}
              stroke={1.5}
              className="text-muted-foreground mr-2 text-sm"
            />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isProfileSettingsOpen !== ""}
        onOpenChange={open => setIsProfileSettingsOpen(open ? "profile" : "")}
      >
        <DialogContent className="flex h-screen flex-col gap-0 p-0 sm:h-[80vh] sm:max-w-[900px]">
          <DialogHeader className="border-b px-4 py-2 pr-2">
            <DialogTitle className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <IconSettings className="mr-1" size={20} stroke={1.5} />{" "}
                Settings
              </div>

              <ButtonWithTooltip
                tooltip="Close"
                tabIndex={-1}
                className="text-xs"
                size="icon"
                variant={"ghost"}
                onClick={() => setIsProfileSettingsOpen("")}
              >
                <IconX stroke={1.5} size={20} />
              </ButtonWithTooltip>
            </DialogTitle>
          </DialogHeader>

          <Tabs
            orientation="vertical"
            value={isProfileSettingsOpen}
            onValueChange={value =>
              value !== "" && setIsProfileSettingsOpen(value)
            }
            className="my-0 flex flex-1 overflow-hidden"
          >
            <TabsList className="flex h-full flex-col justify-start rounded-none border-r sm:w-48">
              <TabsTrigger value="profile" className="w-full justify-start">
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="subscription"
                className="w-full justify-start"
              >
                Subscription
              </TabsTrigger>
              {profile.workspace_migration_enabled && (
                <TabsTrigger value="team" className="w-full justify-start">
                  Team
                </TabsTrigger>
              )}
              <TabsTrigger value="shortcuts" className="w-full  justify-start">
                Shortcuts
              </TabsTrigger>
              <TabsTrigger value="keys" className="w-full justify-start">
                API Keys
              </TabsTrigger>
              <TabsTrigger value="plugins" className="w-full justify-start">
                Plugins
              </TabsTrigger>
              {profile.workspace_migration_enabled && (
                <TabsTrigger value="workspace" className="w-full justify-start">
                  Workspace
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="profile">
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleSaveProfile()
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <Label>Profile Image</Label>
                    <ImagePicker
                      src={profileImageSrc}
                      image={profileImageFile}
                      height={50}
                      width={50}
                      onSrcChange={setProfileImageSrc}
                      onImageChange={setProfileImageFile}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Chat Display Name</Label>
                    <Input
                      placeholder="Chat display name..."
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      maxLength={PROFILE_DISPLAY_NAME_MAX}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm">
                      What would you like the AI to know about you to provide
                      better responses?
                    </Label>
                    <TextareaAutosize
                      value={profileInstructions}
                      onValueChange={setProfileInstructions}
                      placeholder="Profile context... (optional)"
                      minRows={6}
                      maxRows={10}
                    />
                    <LimitDisplay
                      used={profileInstructions.length}
                      limit={PROFILE_CONTEXT_MAX}
                    />
                  </div>
                  <div className="flex items-center justify-between space-y-1">
                    <div className="flex items-center space-x-2">
                      <Label>Artifacts</Label>
                      <WithTooltip
                        asChild={true}
                        trigger={
                          <IconInfoCircle
                            size={18}
                            stroke={1.5}
                            className="text-foreground/60"
                          />
                        }
                        display={
                          <div className={"text-xs"}>
                            Artifacts allow ChatLabs to share substantial,
                            standalone content with you in a dedicated window
                            separate from the main conversation. Artifacts make
                            it easy to work with significant pieces of content
                            that you may want to modify, build upon, or
                            reference later.
                          </div>
                        }
                      />
                    </div>
                    <Switch
                      checked={experimentalCodeEditor}
                      onCheckedChange={setExperimentalCodeEditor}
                    />
                  </div>
                  <Button type="submit">Save Profile</Button>
                </form>
              </TabsContent>

              <TabsContent value="shortcuts">
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleSaveShortcuts()
                  }}
                  className="space-y-4"
                >
                  <div className={"flex items-center justify-between"}>
                    <Label>
                      Send message on{" "}
                      {navigator.platform.toUpperCase().indexOf("MAC") > -1
                        ? "⌘"
                        : "Ctrl"}
                      +Enter
                    </Label>
                    <Switch
                      checked={!sendMessageOnEnter}
                      onCheckedChange={() =>
                        setSendMessageOnEnter(!sendMessageOnEnter)
                      }
                    />
                  </div>

                  <Separator />
                  <div>
                    <div className={"grid grid-cols-2 items-center gap-1"}>
                      <Label>Assistant command</Label>
                      <Input
                        minLength={1}
                        maxLength={1}
                        value={assistantCommand}
                        onChange={e => setAssistantCommand(e.target.value)}
                      />
                      <Label>Plugins command</Label>
                      <Input
                        minLength={1}
                        maxLength={1}
                        value={toolsCommand}
                        onChange={e => setToolsCommand(e.target.value)}
                      />
                      <Label>Prompt command</Label>
                      <Input
                        minLength={1}
                        maxLength={1}
                        value={promptCommand}
                        onChange={e => setPromptCommand(e.target.value)}
                      />
                      <Label>Files command</Label>
                      <Input
                        minLength={1}
                        maxLength={1}
                        value={filesCommand}
                        onChange={e => setFilesCommand(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    variant={"secondary"}
                    onClick={resetToDefaults}
                  >
                    Reset to defaults
                  </Button>
                  <Button type="submit">Save Shortcuts</Button>
                </form>
              </TabsContent>

              <TabsContent value="keys">
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleSaveAPIKeys()
                  }}
                  className="space-y-4"
                >
                  <Callout variant={"info"}>
                    <CalloutTitle className="flex items-center space-x-2">
                      <IconKey className="mr-1 size-4" stroke={1.5} /> API Keys
                    </CalloutTitle>
                    <CalloutDescription>
                      <p>There are two ways to use API keys in ChatLabs:</p>
                      <ol className="mt-2 list-inside list-decimal">
                        <li className="mb-2">
                          <strong>Paid ChatLabs accounts:</strong> By default,
                          ChatLabs provides API keys with usage limits based on
                          your subscription plan. These keys are managed by
                          ChatLabs and ensure a seamless experience.
                        </li>
                        <li>
                          <strong>Your own API keys:</strong> If you provide
                          your own API keys here, ChatLabs will use them
                          instead. This option lifts the plan-based limitations
                          but requires you to manage your own API usage and
                          billing with the respective providers.
                        </li>
                      </ol>
                      <p className="mt-2">
                        Choose the option that best suits your needs and usage
                        patterns.
                      </p>
                    </CalloutDescription>
                  </Callout>
                  <div className="mt-5 space-y-2">
                    <Label className="flex items-center">
                      {useAzureOpenai
                        ? "Azure OpenAI API Key"
                        : "OpenAI API Key"}

                      <Button
                        className="ml-3 h-[18px] w-[150px] text-[11px]"
                        onClick={() => setUseAzureOpenai(!useAzureOpenai)}
                      >
                        {useAzureOpenai
                          ? "Switch To Standard OpenAI"
                          : "Switch To Azure OpenAI"}
                      </Button>
                    </Label>

                    {useAzureOpenai ? (
                      <Input
                        placeholder="Azure OpenAI API Key"
                        type="password"
                        value={azureOpenaiAPIKey}
                        onChange={e => setAzureOpenaiAPIKey(e.target.value)}
                      />
                    ) : (
                      <Input
                        placeholder="OpenAI API Key"
                        type="password"
                        value={openaiAPIKey}
                        onChange={e => setOpenaiAPIKey(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="ml-8 space-y-3">
                    {useAzureOpenai && (
                      <>
                        <div className="space-y-1">
                          <Label>Azure Endpoint</Label>
                          <Input
                            placeholder="https://your-endpoint.openai.azure.com"
                            value={azureOpenaiEndpoint}
                            onChange={e =>
                              setAzureOpenaiEndpoint(e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Azure GPT-3.5 Turbo Deployment Name</Label>
                          <Input
                            placeholder="Azure GPT-3.5 Turbo Deployment Name"
                            value={azureOpenai35TurboID}
                            onChange={e =>
                              setAzureOpenai35TurboID(e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Azure GPT-4.5 Turbo Deployment Name</Label>
                          <Input
                            placeholder="Azure GPT-4.5 Turbo Deployment Name"
                            value={azureOpenai45TurboID}
                            onChange={e =>
                              setAzureOpenai45TurboID(e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Azure GPT-4.5 Vision Deployment Name</Label>
                          <Input
                            placeholder="Azure GPT-4.5 Vision Deployment Name"
                            value={azureOpenai45VisionID}
                            onChange={e =>
                              setAzureOpenai45VisionID(e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Azure Embeddings Deployment Name</Label>
                          <Input
                            placeholder="Azure Embeddings Deployment Name"
                            value={azureEmbeddingsID}
                            onChange={e => setAzureEmbeddingsID(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    {!useAzureOpenai && (
                      <div className="space-y-1">
                        <Label>OpenAI Organization ID</Label>
                        <Input
                          placeholder="OpenAI Organization ID (optional)"
                          type="password"
                          value={openaiOrgID}
                          onChange={e => setOpenaiOrgID(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label>Anthropic API Key</Label>
                    <Input
                      placeholder="Anthropic API Key"
                      type="password"
                      value={anthropicAPIKey}
                      onChange={e => setAnthropicAPIKey(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Google Gemini API Key</Label>
                    <Input
                      placeholder="Google Gemini API Key"
                      type="password"
                      value={googleGeminiAPIKey}
                      onChange={e => setGoogleGeminiAPIKey(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Mistral API Key</Label>
                    <Input
                      placeholder="Mistral API Key"
                      type="password"
                      value={mistralAPIKey}
                      onChange={e => setMistralAPIKey(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Groq API Key</Label>
                    <Input
                      placeholder="Groq API Key"
                      type="password"
                      value={groqAPIKey}
                      onChange={e => setGroqAPIKey(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Perplexity API Key</Label>
                    <Input
                      placeholder="Perplexity API Key"
                      type="password"
                      value={perplexityAPIKey}
                      onChange={e => setPerplexityAPIKey(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>OpenRouter API Key</Label>
                    <Input
                      placeholder="OpenRouter API Key"
                      type="password"
                      value={openrouterAPIKey}
                      onChange={e => setOpenrouterAPIKey(e.target.value)}
                    />
                  </div>
                  <Button type="submit">Save API Keys</Button>
                </form>
              </TabsContent>

              <TabsContent value="subscription">
                <div className="space-y-2">
                  <Label>Current Subscription Plan</Label>
                  <div className="text-xl font-semibold capitalize">
                    {getPlanDisplay(profile, selectedWorkspace)}
                  </div>
                  <p className="text-sm">
                    {
                      {
                        [PLAN_FREE]:
                          "Upgrade to paid plan to unlock all models, plugins and image generation.",
                        [PLAN_PRO]:
                          "Upgrade to Ultimate to get access to OpenAI o1-preview and Claude 3 Opus",
                        [PLAN_ULTIMATE]:
                          "You're on the Ultimate plan! Enjoy your access to all models, plugins and image generation."
                      }[getPlanDisplay(profile, selectedWorkspace)]
                    }
                  </p>
                  {getPlanDisplay(profile, selectedWorkspace) !== PLAN_FREE ? (
                    <Button
                      className="bg-violet-600"
                      loading={loadingBillingPortal}
                      onClick={handleRedirectToBillingPortal}
                    >
                      Manage Subscription
                      {loadingBillingPortal ? (
                        <Loader className="ml-1 size-4 animate-spin" />
                      ) : (
                        <IconExternalLink
                          className="ml-1 size-4"
                          stroke={1.5}
                        />
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="bg-violet-600"
                      onClick={() => setIsPaywallOpen(true)}
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                {selectedWorkspace &&
                  workspaceUsers.find(
                    u =>
                      u.user_id === currentUser?.id &&
                      u.role === "OWNER" &&
                      u.status === "ACTIVE"
                  ) && (
                    <div>
                      <Label>Invite User to the Team</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={inviteEmail}
                          onChange={e => setInviteEmail(e.target.value)}
                        />
                        <Button onClick={() => handleInviteUser(inviteEmail)}>
                          Invite
                        </Button>
                      </div>
                    </div>
                  )}

                {selectedWorkspace && (
                  <div>
                    <Label>Team Members</Label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workspaceUsers.map(user => {
                          const isCurrentUserOwner = workspaceUsers.find(
                            u =>
                              u.user_id === currentUser?.id &&
                              u.role === "OWNER" &&
                              u.status === "ACTIVE"
                          )

                          return (
                            <TableRow key={user.user_id}>
                              <TableCell className="grow">
                                {user.email}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={user.role}
                                  onValueChange={newRole =>
                                    handleRoleChange(user, newRole)
                                  }
                                  disabled={!isCurrentUserOwner}
                                >
                                  <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="OWNER">Owner</SelectItem>
                                    <SelectItem value="MEMBER">
                                      Member
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>{user.status}</TableCell>
                              <TableCell>
                                {isCurrentUserOwner && (
                                  <>
                                    {user.status === "PENDING" && (
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                          handleInviteUser(user.email)
                                        }
                                        className="mr-2"
                                      >
                                        <IconSend size={18} stroke={1.5} />
                                      </Button>
                                    )}
                                    {user.role !== "OWNER" && (
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleRemoveUser(user)}
                                      >
                                        <IconTrash size={18} stroke={1.5} />
                                      </Button>
                                    )}
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              <TabsContent
                value="plugins"
                className="m-0 flex grow flex-col space-y-4"
              >
                <ToolManager />
              </TabsContent>
              <TabsContent value="workspace">
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleSaveWorkspace()
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <Label>Workspace Name</Label>
                    <Input
                      placeholder="Workspace name..."
                      value={workspaceName}
                      onChange={e => setWorkspaceName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Workspace Image</Label>
                    <ImagePicker
                      src={workspaceImageLink}
                      image={workspaceSelectedImage}
                      onSrcChange={setWorkspaceImageLink}
                      onImageChange={setWorkspaceSelectedImage}
                      width={50}
                      height={50}
                    />
                  </div>

                  <Button type="submit">Save Workspace</Button>
                </form>

                <Separator className="my-6" />

                <Callout variant="destructive" className="mt-6">
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Danger Zone</Label>
                    <p className="text-sm">
                      Once you delete a workspace, there is no going back.
                      Please be certain.
                    </p>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteWorkspace}
                      disabled={isDeletingWorkspace || workspaces.length <= 1}
                    >
                      {isDeletingWorkspace ? "Deleting..." : "Delete Workspace"}
                    </Button>
                  </div>
                </Callout>
              </TabsContent>
            </div>
          </Tabs>
          <DialogDescription />
        </DialogContent>
      </Dialog>
    </>
  )
}
