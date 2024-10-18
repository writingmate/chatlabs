import { ChatbotUIContext } from "@/context/context"
import { WORKSPACE_INSTRUCTIONS_MAX } from "@/db/limits"
import {
  getWorkspaceImageFromStorage,
  uploadWorkspaceImage
} from "@/db/storage/workspace-images"
import { updateWorkspace } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { LLMID } from "@/types"
import {
  IconHome,
  IconSettings,
  IconInfoCircle,
  IconExternalLink
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { ChatSettingsForm } from "../ui/chat-settings-form"
import ImagePicker from "../ui/image-picker"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { LimitDisplay } from "../ui/limit-display"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { WithTooltip } from "../ui/with-tooltip"
import { DeleteWorkspace } from "./delete-workspace"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/browser-client"
import { inviteUser } from "@/actions/invite"
import { PLAN_FREE, PLAN_PRO, PLAN_ULTIMATE } from "@/lib/stripe/config"
import { Loader } from "lucide-react"
import { redirectToBillingPortal } from "@/actions/stripe"

export const SIDEBAR_ICON_SIZE = 28

interface WorkspaceSettingsProps {
  isCollapsed: boolean
}

export const WorkspaceSettings: FC<WorkspaceSettingsProps> = ({
  isCollapsed
}) => {
  const {
    profile,
    selectedWorkspace,
    setSelectedWorkspace,
    setWorkspaces,
    setChatSettings,
    workspaceImages,
    setWorkspaceImages,
    setIsPaywallOpen
  } = useContext(ChatbotUIContext)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)

  const [name, setName] = useState(selectedWorkspace?.name || "")
  const [imageLink, setImageLink] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [description, setDescription] = useState(
    selectedWorkspace?.description || ""
  )
  const [instructions, setInstructions] = useState(
    selectedWorkspace?.instructions || ""
  )
  const [emailToInvite, setEmailToInvite] = useState("")
  const [sharing, setSharing] = useState(selectedWorkspace?.sharing || "")
  const [inviteInProgress, setInviteInProgress] = useState(false)
  const [loadingBillingPortal, setLoadingBillingPortal] = useState(false)

  const [defaultChatSettings, setDefaultChatSettings] = useState({
    model: selectedWorkspace?.default_model,
    prompt: selectedWorkspace?.default_prompt,
    temperature: selectedWorkspace?.default_temperature,
    contextLength: selectedWorkspace?.default_context_length,
    includeProfileContext: selectedWorkspace?.include_profile_context,
    includeWorkspaceInstructions:
      selectedWorkspace?.include_workspace_instructions,
    embeddingsProvider: selectedWorkspace?.embeddings_provider
  })

  useEffect(() => {
    const workspaceImage =
      workspaceImages.find(
        image => image.path === selectedWorkspace?.image_path
      )?.base64 || ""

    setImageLink(workspaceImage)
  }, [workspaceImages])

  const handleSave = async () => {
    if (!selectedWorkspace) return

    let imagePath = ""

    if (selectedImage) {
      imagePath = await uploadWorkspaceImage(selectedWorkspace, selectedImage)

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
      ...selectedWorkspace,
      name,
      description,
      image_path: imagePath,
      instructions,
      default_model: defaultChatSettings.model,
      default_prompt: defaultChatSettings.prompt,
      default_temperature: defaultChatSettings.temperature,
      default_context_length: defaultChatSettings.contextLength,
      embeddings_provider: defaultChatSettings.embeddingsProvider,
      include_profile_context: defaultChatSettings.includeProfileContext,
      include_workspace_instructions:
        defaultChatSettings.includeWorkspaceInstructions,
      sharing
    })

    if (
      defaultChatSettings.model &&
      defaultChatSettings.prompt &&
      defaultChatSettings.temperature &&
      defaultChatSettings.contextLength &&
      defaultChatSettings.includeProfileContext &&
      defaultChatSettings.includeWorkspaceInstructions &&
      defaultChatSettings.embeddingsProvider
    ) {
      setChatSettings({
        model: defaultChatSettings.model as LLMID,
        prompt: defaultChatSettings.prompt,
        temperature: defaultChatSettings.temperature,
        contextLength: defaultChatSettings.contextLength,
        includeProfileContext: defaultChatSettings.includeProfileContext,
        includeWorkspaceInstructions:
          defaultChatSettings.includeWorkspaceInstructions,
        embeddingsProvider: defaultChatSettings.embeddingsProvider as
          | "openai"
          | "local"
      })
    }

    setIsOpen(false)
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

  const handleInviteUser = async () => {
    try {
      setInviteInProgress(true)

      await inviteUser({
        email: emailToInvite,
        workspace_id: selectedWorkspace?.id
      })

      setInviteInProgress(false)

      toast.success("User has been successfully invited")
    } catch (error) {
      toast.error("Unable to send the invitation due to an unexpected error")
      console.error(error)
    } finally {
      setInviteInProgress(false)
    }
  }

  const handleRedirectToBillingPortal = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation()
    e.preventDefault()
    setLoadingBillingPortal(true)
    try {
      await redirectToBillingPortal()
    } catch (error) {
      toast.error(
        "Failed to redirect to billing portal. Something went wrong. Please try again."
      )
    } finally {
      setLoadingBillingPortal(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      buttonRef.current?.click()
    }
  }

  if (!selectedWorkspace || !profile) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex w-full items-center justify-start space-x-2 rounded-lg p-2 pl-1 text-sm"
          )}
        >
          <IconHome size={SIDEBAR_ICON_SIZE} />
          {!isCollapsed && (
            <div className="flex w-full items-center justify-between">
              <div>{profile.display_name}</div>
              <IconSettings
                size={18}
                className="text-muted-foreground"
                stroke={1.5}
              />
            </div>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        className="flex flex-col justify-between"
        side="left"
        onKeyDown={handleKeyDown}
      >
        <div className="grow overflow-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Workspace Settings
              {selectedWorkspace?.is_home && <IconHome />}
            </SheetTitle>

            {selectedWorkspace?.is_home && (
              <div className="text-sm font-light">
                This is your home workspace for personal use.
              </div>
            )}
          </SheetHeader>

          <Tabs defaultValue="main">
            <TabsList className="mt-4 grid w-full grid-cols-2">
              <TabsTrigger value="main">Main</TabsTrigger>
              <TabsTrigger value="defaults">Defaults</TabsTrigger>
            </TabsList>

            <TabsContent className="mt-4 space-y-4" value="main">
              <>
                <div className="space-y-1">
                  <Label>Workspace Name</Label>

                  <Input
                    placeholder="Name..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                {/* <div className="space-y-1">
                  <Label>Description</Label>

                  <Input
                    placeholder="Description... (optional)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div> */}

                <div className="space-y-1">
                  <Label>Workspace Image</Label>

                  <ImagePicker
                    src={imageLink}
                    image={selectedImage}
                    onSrcChange={setImageLink}
                    onImageChange={setSelectedImage}
                    width={50}
                    height={50}
                  />
                </div>
              </>

              <div className="space-y-1">
                <Label>
                  How would you like the AI to respond in this workspace?
                </Label>

                <TextareaAutosize
                  placeholder="Instructions... (optional)"
                  value={instructions}
                  onValueChange={setInstructions}
                  minRows={5}
                  maxRows={10}
                  maxLength={1500}
                />

                <LimitDisplay
                  used={instructions.length}
                  limit={WORKSPACE_INSTRUCTIONS_MAX}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Label>Public resources</Label>
                  <WithTooltip
                    asChild
                    trigger={
                      <IconInfoCircle
                        size={18}
                        stroke={1.5}
                        className="text-foreground/60"
                      />
                    }
                    display={
                      <div className={"text-xs"}>
                        Share Prompts, Assistants, Files, Plugins between all
                        the users in the workspace
                      </div>
                    }
                  />
                </div>
                <Switch
                  checked={sharing === "public"}
                  onCheckedChange={checked =>
                    setSharing(checked ? "public" : "private")
                  }
                />
              </div>
              <Separator />
              <div className="space-y-1">
                <Label>Invite user to the workspace</Label>
                <Input
                  placeholder="Email"
                  value={emailToInvite}
                  onChange={e => setEmailToInvite(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                variant={"outline"}
                onClick={handleInviteUser}
                disabled={inviteInProgress}
              >
                Invite user
              </Button>
              <div className="space-y-2">
                <Label>Current Subscription Plan</Label>
                <div className="text-xl font-semibold capitalize">
                  {profile.plan.split("_")[0]}
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
                    }[profile.plan.split("_")[0]]
                  }
                </p>
                {profile?.plan !== PLAN_FREE ? (
                  <Button
                    className="bg-violet-600"
                    loading={loadingBillingPortal}
                    onClick={handleRedirectToBillingPortal}
                  >
                    Manage Subscription
                    {loadingBillingPortal ? (
                      <Loader className="ml-1 size-4 animate-spin" />
                    ) : (
                      <IconExternalLink className="ml-1 size-4" stroke={1.5} />
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

            <TabsContent className="mt-5" value="defaults">
              <div className="mb-4 text-sm">
                These are the settings your workspace begins with when selected.
              </div>

              <ChatSettingsForm
                chatSettings={defaultChatSettings as any}
                onChangeChatSettings={setDefaultChatSettings}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 flex justify-between">
          <div>
            {!selectedWorkspace.is_home && (
              <DeleteWorkspace
                workspace={selectedWorkspace}
                onDelete={() => setIsOpen(false)}
              />
            )}
          </div>

          <div className="space-x-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>

            <Button ref={buttonRef} onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
