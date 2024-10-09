import { ChatbotUIContext } from "@/context/context"
import {
  PROFILE_CONTEXT_MAX,
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_USERNAME_MAX,
  PROFILE_USERNAME_MIN
} from "@/db/limits"
import { updateProfile } from "@/db/profile"
import { uploadProfileImage } from "@/db/storage/profile-images"
import { exportLocalStorageAsJSON } from "@/lib/export-old-data"
import { fetchOpenRouterModels } from "@/lib/models/fetch-models"
import { LLM_LIST_MAP } from "@/lib/models/llm/llm-list"
import { supabase } from "@/lib/supabase/browser-client"
import { cn } from "@/lib/utils"
import { LLM, OpenRouterLLM } from "@/types"
import {
  IconExternalLink,
  IconFileDownload,
  IconInfoCircle,
  IconKey,
  IconLogout,
  IconSettings,
  IconUser
} from "@tabler/icons-react"
import Image from "next/image"
import { useRouter, redirect } from "next/navigation"
import { FC, Fragment, useCallback, useContext, useRef, useState } from "react"
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
import useTranslate from "@/lib/hooks/use-translate"

interface ProfileSettingsProps {
  isCollapsed: boolean
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
    setIsProfileSettingsOpen
  } = useContext(ChatbotUIContext)

  const [loadingBillingPortal, setLoadingBillingPortal] = useState(false)

  const router = useRouter()
  const { translate } = useTranslate()

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [username, setUsername] = useState<string>(profile?.username ?? "")
  const [usernameAvailable, setUsernameAvailable] = useState(true)
  const [loadingUsername, setLoadingUsername] = useState(false)
  const [experimentalCodeEditor, setExperimentalCodeEditor] = useState(
    profile?.experimental_code_editor || false
  )
  const [profileImageSrc, setProfileImageSrc] = useState(
    profile?.image_url || ""
  )
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileInstructions, setProfileInstructions] = useState<string>(
    profile?.profile_context ?? ""
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
    return
  }

  const handleSave = async () => {
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
      openrouter_api_key: openrouterAPIKey,
      send_message_on_enter: sendMessageOnEnter,
      tools_command: toolsCommand,
      assistant_command: assistantCommand,
      files_command: filesCommand,
      prompt_command: promptCommand,
      experimental_code_editor: experimentalCodeEditor
    })

    setProfile(updatedProfile)

    toast.success("Profile updated!")

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
      let providerKey: keyof typeof profile

      if (provider === "google") {
        providerKey = "google_gemini_api_key"
      } else if (provider === "azure") {
        providerKey = "azure_openai_api_key"
      } else {
        providerKey = `${provider}_api_key` as keyof typeof profile
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
          } else {
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

    setIsProfileSettingsOpen("")
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

  if (!profile) return null

  return (
    <Dialog
      open={isProfileSettingsOpen !== ""}
      onOpenChange={open => setIsProfileSettingsOpen(open ? "profile" : "")}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex w-full items-center justify-start space-x-2 rounded-lg p-2 pl-1 text-sm"
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
              <IconSettings
                size={18}
                className="text-muted-foreground"
                stroke={1.5}
              />
            </div>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-screen flex-col gap-0 p-0 sm:h-[80vh] sm:max-w-[900px]">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <IconSettings className="mr-1" size={20} stroke={1.5} /> Settings
            </div>

            <ButtonWithTooltip
              tooltip="Sign out"
              tabIndex={-1}
              className="text-xs"
              size="icon"
              variant={"ghost"}
              onClick={handleSignOut}
            >
              <IconLogout stroke={1.5} size={20} />
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
            <TabsTrigger value="shortcuts" className="w-full  justify-start">
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="keys" className="w-full justify-start">
              API Keys
            </TabsTrigger>
            <TabsTrigger value="subscription" className="w-full justify-start">
              Subscription
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="profile">
              <form className={"space-y-2"}>
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
                    placeholder={translate("Chat display name...")}
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    maxLength={PROFILE_DISPLAY_NAME_MAX}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">
                    {translate(
                      "What would you like the AI to know about you to provide better responses?"
                    )}
                  </Label>
                  <TextareaAutosize
                    value={profileInstructions}
                    onValueChange={setProfileInstructions}
                    placeholder="Profile context... (optional)"
                    minRows={6}
                    maxRows={10}
                  />
                  <LimitDisplay
                    used={profileInstructions?.length ?? 0}
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
                          {translate(
                            "If enabled, code will be displayed in a side-by-side editor on the right from the message thread. This feature is currently in beta."
                          )}
                        </div>
                      }
                    />
                  </div>
                  <Switch
                    checked={experimentalCodeEditor}
                    onCheckedChange={setExperimentalCodeEditor}
                  />
                </div>
              </form>
            </TabsContent>

            <TabsContent value="shortcuts">
              <div className="space-y-5">
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
              </div>
            </TabsContent>

            <TabsContent value="keys">
              <Callout variant={"info"}>
                <CalloutTitle className="flex items-center space-x-2">
                  <IconKey className="mr-1 size-4" stroke={1.5} /> API Keys
                </CalloutTitle>
                <CalloutDescription>
                  <p>There are two ways to use API keys in ChatLabs:</p>
                  <ol className="mt-2 list-inside list-decimal">
                    <li className="mb-2">
                      <strong>Paid ChatLabs accounts:</strong> By default,
                      ChatLabs provides API keys with usage limits based on your
                      subscription plan. These keys are managed by ChatLabs and
                      ensure a seamless experience.
                    </li>
                    <li>
                      <strong>Your own API keys:</strong> If you provide your
                      own API keys here, ChatLabs will use them instead. This
                      option lifts the plan-based limitations but requires you
                      to manage your own API usage and billing with the
                      respective providers.
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
                  {useAzureOpenai ? "Azure OpenAI API Key" : "OpenAI API Key"}

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
                        onChange={e => setAzureOpenaiEndpoint(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Azure GPT-3.5 Turbo Deployment Name</Label>
                      <Input
                        placeholder="Azure GPT-3.5 Turbo Deployment Name"
                        value={azureOpenai35TurboID}
                        onChange={e => setAzureOpenai35TurboID(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Azure GPT-4.5 Turbo Deployment Name</Label>
                      <Input
                        placeholder="Azure GPT-4.5 Turbo Deployment Name"
                        value={azureOpenai45TurboID}
                        onChange={e => setAzureOpenai45TurboID(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Azure GPT-4.5 Vision Deployment Name</Label>
                      <Input
                        placeholder="Azure GPT-4.5 Vision Deployment Name"
                        value={azureOpenai45VisionID}
                        onChange={e => setAzureOpenai45VisionID(e.target.value)}
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
            </TabsContent>

            <TabsContent value="subscription">
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
          </div>
        </Tabs>

        <DialogFooter className="border-t px-6 py-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center space-x-2">
              <ThemeSwitcher />
              <WithTooltip
                display={
                  <div>
                    Download ImogenAI 1.0 data as JSON. Import coming soon!
                  </div>
                }
                trigger={
                  <Button
                    variant={"ghost"}
                    size="icon"
                    onClick={exportLocalStorageAsJSON}
                  >
                    <IconFileDownload size={SIDEBAR_ICON_SIZE} stroke={1.5} />
                  </Button>
                }
              />
            </div>
            <div className="space-x-2">
              <Button
                variant="ghost"
                onClick={() => setIsProfileSettingsOpen("")}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
