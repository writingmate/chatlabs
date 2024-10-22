// TODO: Separate into multiple contexts, keeping simple for now

"use client"

import { ChatbotUIContext } from "@/context/context"
import { getProfileByUserId } from "@/db/profile"
import { getWorkspaceImageFromStorage } from "@/db/storage/workspace-images"
import {
  getWorkspaceById,
  getWorkspaces,
  getWorkspacesByUserId
} from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import {
  fetchHostedModels,
  fetchOllamaModels,
  fetchOpenRouterModels
} from "@/lib/models/fetch-models"
import { supabase } from "@/lib/supabase/browser-client"
import { Tables } from "@/supabase/types"
import {
  ChatFile,
  ChatMessage,
  ChatSettings,
  LLM,
  LLMID,
  MessageImage,
  ModelProvider,
  OpenRouterLLM,
  WorkspaceImage
} from "@/types"
import { AssistantImage } from "@/types/images/assistant-image"
import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { useRouter } from "nextjs-toploader/app"
import { FC, useEffect, useState } from "react"
import { isMobileScreen } from "@/lib/mobile"
import { getPopularAssistants } from "@/db/assistants"
import { getPublicTools } from "@/db/tools"
import { getPlatformTools } from "@/db/platform-tools"
import { onlyUniqueById } from "@/lib/utils"
import { getAssistantPublicImageUrl } from "@/db/storage/assistant-images"
import { Loading } from "@/components/ui/loading"

interface GlobalStateProps {
  children: React.ReactNode
}

export const GlobalState: FC<GlobalStateProps> = ({ children }) => {
  const router = useRouter()

  // PROFILE STORE
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null)

  // ITEMS STORE
  const [assistants, setAssistants] = useState<Tables<"assistants">[]>([])
  const [collections, setCollections] = useState<Tables<"collections">[]>([])
  const [chats, setChats] = useState<Tables<"chats">[]>([])
  const [files, setFiles] = useState<Tables<"files">[]>([])
  const [folders, setFolders] = useState<Tables<"folders">[]>([])
  const [models, setModels] = useState<Tables<"models">[]>([])
  const [presets, setPresets] = useState<Tables<"presets">[]>([])
  const [prompts, setPrompts] = useState<Tables<"prompts">[]>([])
  const [tools, setTools] = useState<Tables<"tools">[]>([])
  const [platformTools, setPlatformTools] = useState<Tables<"tools">[]>([])
  const [workspaces, setWorkspaces] = useState<Tables<"workspaces">[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // MODELS STORE
  const [envKeyMap, setEnvKeyMap] = useState<Record<string, VALID_ENV_KEYS>>({})
  const [availableHostedModels, setAvailableHostedModels] = useState<LLM[]>([])
  const [availableLocalModels, setAvailableLocalModels] = useState<LLM[]>([])
  const [availableOpenRouterModels, setAvailableOpenRouterModels] = useState<
    OpenRouterLLM[]
  >([])
  const [allModels, setAllModels] = useState<LLM[]>([])

  // WORKSPACE STORE
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<Tables<"workspaces"> | null>(() => {
      if (typeof window !== "undefined") {
        const storedWorkspace =
          window?.localStorage?.getItem("selectedWorkspace")
        if (storedWorkspace) {
          return JSON.parse(storedWorkspace)
        }
      }
      return null
    })
  const [workspaceImages, setWorkspaceImages] = useState<WorkspaceImage[]>([])

  // PRESET STORE
  const [selectedPreset, setSelectedPreset] =
    useState<Tables<"presets"> | null>(null)

  // ASSISTANT STORE
  const [selectedAssistant, setSelectedAssistant] =
    useState<Tables<"assistants"> | null>(null)
  const [assistantImages, setAssistantImages] = useState<AssistantImage[]>([])
  const [openaiAssistants, setOpenaiAssistants] = useState<any[]>([])

  // PASSIVE CHAT STORE
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatSettings, setChatSettings] = useState<ChatSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedSettings = window?.localStorage?.getItem("chatSettings")

        if (storedSettings) {
          return JSON.parse(storedSettings)
        }
      } catch (error) {
        console.error("Error getting chat settings:", error)
      }
    }

    return {
      model: "gpt-4o-mini",
      prompt: "You are a helpful AI assistant.",
      temperature: 0.5,
      contextLength: 4000,
      includeProfileContext: true,
      includeWorkspaceInstructions: true,
      embeddingsProvider: "openai"
    }
  })
  const [selectedChat, setSelectedChat] = useState<Tables<"chats"> | null>(null)
  const [chatFileItems, setChatFileItems] = useState<Tables<"file_items">[]>([])

  // ACTIVE CHAT STORE
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [firstTokenReceived, setFirstTokenReceived] = useState<boolean>(false)
  const [abortController, setAbortController] =
    useState<AbortController | null>(null)

  // CHAT INPUT COMMAND STORE
  const [isMessageHistoryPickerOpen, setIsMessageHistoryPickerOpen] =
    useState(false)
  const [isPromptPickerOpen, setIsPromptPickerOpen] = useState(false)
  const [slashCommand, setSlashCommand] = useState("")
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false)
  const [hashtagCommand, setHashtagCommand] = useState("")
  const [isToolPickerOpen, setIsToolPickerOpen] = useState(false)
  const [toolCommand, setToolCommand] = useState("")
  const [focusPrompt, setFocusPrompt] = useState(false)
  const [focusFile, setFocusFile] = useState(false)
  const [focusTool, setFocusTool] = useState(false)
  const [focusAssistant, setFocusAssistant] = useState(false)
  const [atCommand, setAtCommand] = useState("")
  const [isAssistantPickerOpen, setIsAssistantPickerOpen] = useState(false)
  const [showPromptVariables, setShowPromptVariables] = useState(false)
  const [promptVariables, setPromptVariables] = useState<
    {
      promptId: string
      name: string
      value: string
    }[]
  >([])

  // ATTACHMENTS STORE
  const [chatFiles, setChatFiles] = useState<ChatFile[]>([])
  const [chatImages, setChatImages] = useState<MessageImage[]>([])
  const [newMessageFiles, setNewMessageFiles] = useState<ChatFile[]>([])
  const [newMessageImages, setNewMessageImages] = useState<MessageImage[]>([])
  const [showFilesDisplay, setShowFilesDisplay] = useState<boolean>(false)

  // RETIEVAL STORE
  const [useRetrieval, setUseRetrieval] = useState<boolean>(true)
  const [sourceCount, setSourceCount] = useState<number>(4)

  // TOOL STORE
  const [selectedTools, setSelectedTools] = useState<Tables<"tools">[]>([])
  const [toolInUse, setToolInUse] = useState<string>("none")

  // PAYWALL

  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false)

  // PROFILE SETTINGS
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState<string>("")

  // SIDEBAR
  const [showSidebar, setShowSidebar] = useState<boolean>(
    () => !isMobileScreen()
  )

  const [fetchingStartingData, setFetchingStartingData] =
    useState<boolean>(false)

  useEffect(() => {
    if (fetchingStartingData) return
    setFetchingStartingData(true)
    ;(async () => {
      try {
        const profile = await fetchStartingData()
        const hostedModelRes = await fetchHostedModels(profile)
        if (!hostedModelRes) return

        const allModels = []

        setEnvKeyMap(hostedModelRes.envKeyMap)
        setAvailableHostedModels(hostedModelRes.hostedModels)

        allModels.push(...hostedModelRes.hostedModels)

        if (profile) {
          if (
            profile["openrouter_api_key"] ||
            hostedModelRes.envKeyMap["openrouter"]
          ) {
            const openRouterModels = await fetchOpenRouterModels()
            if (!openRouterModels) return
            allModels.push(...openRouterModels)
            setAvailableOpenRouterModels(openRouterModels)
          }
        }

        if (process.env.NEXT_PUBLIC_OLLAMA_URL) {
          const localModels = await fetchOllamaModels()
          if (!localModels) return
          allModels.push(...localModels)
          setAvailableLocalModels(localModels)
        }

        setAllModels([
          ...models.map(model => ({
            modelId: model.model_id as LLMID,
            modelName: model.name,
            provider: "custom" as ModelProvider,
            hostedId: model.id,
            platformLink: "",
            imageInput: false,
            paid: "paid" in model ? !!model.paid : false,
            maxContext: null
          })),
          ...allModels
        ])

        setFetchingStartingData(false)
      } catch (error) {
        setFetchingStartingData(false)
        setLoading(false)
        console.error("Error fetching models:", error)
      }
    })()
  }, [selectedWorkspace])

  useEffect(() => {
    if (chatSettings) {
      try {
        localStorage.setItem("chatSettings", JSON.stringify(chatSettings))
      } catch (error) {
        console.error("Error setting chat settings:", error)
      }
    }

    if (selectedWorkspace) {
      localStorage.setItem(
        "selectedWorkspace",
        JSON.stringify(selectedWorkspace)
      )
    }
  }, [chatSettings, selectedWorkspace])

  const fetchStartingData = async (): Promise<
    (Tables<"profiles"> & { workspace: Tables<"workspaces"> }) | undefined
  > => {
    const session = (await supabase.auth.getSession()).data.session

    if (!session) {
      setLoading(false)
      return undefined
    }
    const user = session.user

    const profile = await getProfileByUserId(user.id)

    setProfile(profile)

    const workspaces = await getWorkspaces()
    setWorkspaces(workspaces)

    for (const workspace of workspaces) {
      let workspaceImageUrl = ""

      if (workspace.image_path) {
        workspaceImageUrl =
          (await getWorkspaceImageFromStorage(workspace.image_path)) || ""
      }

      if (workspaceImageUrl) {
        const response = await fetch(workspaceImageUrl)
        const blob = await response.blob()
        const base64 = await convertBlobToBase64(blob)

        setWorkspaceImages(prev => [
          ...prev,
          {
            workspaceId: workspace.id,
            path: workspace.image_path,
            base64: base64,
            url: workspaceImageUrl
          }
        ])
      }
    }

    const workspaceToFetch =
      selectedWorkspace || workspaces.find(w => w.is_home)

    await fetchWorkspaceData(
      workspaceToFetch?.id as string,
      profile?.user_id as string
    )
    setChatMessages([])
    setSelectedChat(null)
    setIsGenerating(false)
    setFirstTokenReceived(false)
    setChatFiles([])
    setChatImages([])
    setNewMessageFiles([])
    setNewMessageImages([])
    setShowFilesDisplay(false)

    setLoading(false)

    return { ...profile, workspace: workspaceToFetch! }
  }

  const fetchWorkspaceData = async (workspaceId: string, userId: string) => {
    setLoading(true)

    try {
      const workspace = await getWorkspaceById(workspaceId)
      if (!workspace) {
        router.push("/")
        return
      }
      setSelectedWorkspace(workspace)

      const [popularAssistants, publicToolData, platformToolData] =
        await Promise.all([
          getPopularAssistants(workspaceId, userId),
          getPublicTools(),
          getPlatformTools()
        ])

      setAssistants(popularAssistants)
      setChats(workspace.chats)
      setFolders(workspace.folders)
      setFiles(workspace.files)
      setPrompts(workspace.prompts)
      setTools(
        [...platformToolData, ...workspace.tools, ...publicToolData].filter(
          onlyUniqueById
        )
      )
      setPlatformTools(platformToolData)
      setModels(workspace.models)

      const parallelize = async (array: any, callback: any) => {
        const promises = array.map((item: any) => callback(item))
        return Promise.all(promises)
      }

      await parallelize(popularAssistants, async (assistant: any) => {
        let url = assistant.image_path
          ? getAssistantPublicImageUrl(assistant.image_path)
          : ""

        if (url) {
          // const response = await fetch(url)
          // const blob = await response.blob()
          // const base64 = await convertBlobToBase64(blob)

          setAssistantImages(prev => [
            ...prev,
            {
              assistantId: assistant.id,
              path: assistant.image_path,
              base64: "",
              url
            }
          ])
        } else {
          setAssistantImages(prev => [
            ...prev,
            {
              assistantId: assistant.id,
              path: assistant.image_path,
              base64: "",
              url
            }
          ])
        }
      })

      setChatSettings({
        model: (chatSettings?.model ||
          workspace?.default_model ||
          "gpt-3.5-turbo-0125") as LLMID,
        prompt:
          // chatSettings?.prompt ||
          workspace?.default_prompt ||
          "You are a friendly, helpful AI assistant.",
        temperature:
          // chatSettings?.temperature ||
          workspace?.default_temperature || 0.5,
        contextLength:
          // chatSettings?.contextLength ||
          workspace?.default_context_length || 4096,
        includeProfileContext:
          // chatSettings?.includeProfileContext ||
          workspace?.include_profile_context || true,
        includeWorkspaceInstructions:
          // chatSettings?.includeWorkspaceInstructions ||
          workspace?.include_workspace_instructions || true,
        embeddingsProvider:
          // chatSettings?.embeddingsProvider ||
          (workspace?.embeddings_provider as "openai" | "local") || "openai"
      })

      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
      router.push("/")
    }
  }

  if (loading) {
    return <Loading withMessage={true} />
  }

  return (
    <ChatbotUIContext.Provider
      value={{
        // PROFILE STORE
        profile,
        setProfile,

        // ITEMS STORE
        assistants,
        setAssistants,
        collections,
        setCollections,
        chats,
        setChats,
        files,
        setFiles,
        folders,
        setFolders,
        models,
        setModels,
        presets,
        setPresets,
        prompts,
        setPrompts,
        tools,
        setTools,
        platformTools,
        setPlatformTools,
        workspaces,
        setWorkspaces,

        // MODELS STORE
        envKeyMap,
        setEnvKeyMap,
        availableHostedModels,
        setAvailableHostedModels,
        availableLocalModels,
        setAvailableLocalModels,
        availableOpenRouterModels,
        setAvailableOpenRouterModels,

        // WORKSPACE STORE
        selectedWorkspace,
        setSelectedWorkspace,
        workspaceImages,
        setWorkspaceImages,

        // PRESET STORE
        selectedPreset,
        setSelectedPreset,

        // ASSISTANT STORE
        selectedAssistant,
        setSelectedAssistant,
        assistantImages,
        setAssistantImages,
        openaiAssistants,
        setOpenaiAssistants,

        // PASSIVE CHAT STORE
        chatMessages,
        setChatMessages,
        chatSettings,
        setChatSettings,
        selectedChat,
        setSelectedChat,
        chatFileItems,
        setChatFileItems,

        // ACTIVE CHAT STORE
        isGenerating,
        setIsGenerating,
        firstTokenReceived,
        setFirstTokenReceived,
        abortController,
        setAbortController,

        // CHAT INPUT COMMAND STORE
        isMessageHistoryPickerOpen,
        setIsMessageHistoryPickerOpen,
        isPromptPickerOpen,
        setIsPromptPickerOpen,
        slashCommand,
        setSlashCommand,
        isFilePickerOpen,
        setIsFilePickerOpen,
        hashtagCommand,
        setHashtagCommand,
        isToolPickerOpen,
        setIsToolPickerOpen,
        toolCommand,
        setToolCommand,
        focusPrompt,
        setFocusPrompt,
        focusFile,
        setFocusFile,
        focusTool,
        setFocusTool,
        focusAssistant,
        setFocusAssistant,
        atCommand,
        setAtCommand,
        isAssistantPickerOpen,
        setIsAssistantPickerOpen,
        promptVariables,
        setPromptVariables,
        showPromptVariables,
        setShowPromptVariables,

        // ATTACHMENT STORE
        chatFiles,
        setChatFiles,
        chatImages,
        setChatImages,
        newMessageFiles,
        setNewMessageFiles,
        newMessageImages,
        setNewMessageImages,
        showFilesDisplay,
        setShowFilesDisplay,

        // RETRIEVAL STORE
        useRetrieval,
        setUseRetrieval,
        sourceCount,
        setSourceCount,

        // TOOL STORE
        selectedTools,
        setSelectedTools,
        toolInUse,
        setToolInUse,

        // PAYWALL
        isPaywallOpen,
        setIsPaywallOpen,

        showSidebar,
        setShowSidebar,

        allModels,
        setAllModels,

        // PROFILE SETTINGS
        isProfileSettingsOpen,
        setIsProfileSettingsOpen
      }}
    >
      {children}
    </ChatbotUIContext.Provider>
  )
}
