"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { ChatbotUIContext } from "@/context/context"
import {
  getAssistantWorkspacesByWorkspaceId,
  getPublicAssistants
} from "@/db/assistants"
import { getChatsByWorkspaceId } from "@/db/chats"
import { getCollectionWorkspacesByWorkspaceId } from "@/db/collections"
import { getFileWorkspacesByWorkspaceId } from "@/db/files"
import { getFoldersByWorkspaceId } from "@/db/folders"
import { getModelWorkspacesByWorkspaceId } from "@/db/models"
import { getPresetWorkspacesByWorkspaceId } from "@/db/presets"
import { getPromptWorkspacesByWorkspaceId } from "@/db/prompts"
import {
  getAssistantImageFromStorage,
  getAssistantPublicImageUrl
} from "@/db/storage/assistant-images"
import { getPublicTools, getToolWorkspacesByWorkspaceId } from "@/db/tools"
import { getWorkspaceById } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { supabase } from "@/lib/supabase/browser-client"
import { LLMID } from "@/types"
import { useParams, useRouter } from "next/navigation"
import { ReactNode, useContext, useEffect, useState } from "react"
import Loading from "../loading"
import { getPlatformTools } from "@/db/platform-tools"

interface WorkspaceLayoutProps {
  children: ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const router = useRouter()

  const params = useParams()
  const workspaceId = params.workspaceid as string

  const {
    chatSettings,
    setChatSettings,
    setAssistants,
    setAssistantImages,
    setChats,
    setCollections,
    setFolders,
    setFiles,
    setPresets,
    setPrompts,
    setTools,
    setPlatformTools,
    setModels,
    selectedWorkspace,
    setSelectedWorkspace,
    setSelectedChat,
    setChatMessages,
    setUserInput,
    setIsGenerating,
    setFirstTokenReceived,
    setChatFiles,
    setChatImages,
    setNewMessageFiles,
    setNewMessageImages,
    setShowFilesDisplay
  } = useContext(ChatbotUIContext)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const session = (await supabase.auth.getSession()).data.session

      if (!session) {
        return router.push("/login")
      } else {
        await fetchWorkspaceData(workspaceId)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => await fetchWorkspaceData(workspaceId))()
    setUserInput("")
    setChatMessages([])
    setSelectedChat(null)
    setIsGenerating(false)
    setFirstTokenReceived(false)
    setChatFiles([])
    setChatImages([])
    setNewMessageFiles([])
    setNewMessageImages([])
    setShowFilesDisplay(false)
  }, [workspaceId])

  const fetchWorkspaceData = async (workspaceId: string) => {
    setLoading(true)

    const workspace = await getWorkspaceById(workspaceId)
    setSelectedWorkspace(workspace)

    // const assistantData = await getAssistantWorkspacesByWorkspaceId(workspaceId)

    // const publicAssistantData = await getPublicAssistants()

    // function to fetch unique values from array by id

    function onlyUniqueById(value: any, index: any, self: any) {
      return self.findIndex((item: any) => item.id === value.id) === index
    }

    const [
      workspaceData,
      assistantData,
      publicAssistantData,
      chats,
      collectionData,
      folders,
      fileData,
      presetData,
      promptData,
      toolData,
      publicToolData,
      platformToolData,
      modelData
    ] = await Promise.all([
      getWorkspaceById(workspaceId),
      getAssistantWorkspacesByWorkspaceId(workspaceId),
      getPublicAssistants(),
      getChatsByWorkspaceId(workspaceId),
      getCollectionWorkspacesByWorkspaceId(workspaceId),
      getFoldersByWorkspaceId(workspaceId),
      getFileWorkspacesByWorkspaceId(workspaceId),
      getPresetWorkspacesByWorkspaceId(workspaceId),
      getPromptWorkspacesByWorkspaceId(workspaceId),
      getToolWorkspacesByWorkspaceId(workspaceId),
      getPublicTools(),
      getPlatformTools(),
      getModelWorkspacesByWorkspaceId(workspaceId)
    ])

    setSelectedWorkspace(workspaceData)
    setAssistants(
      [...assistantData.assistants, ...publicAssistantData].filter(
        onlyUniqueById
      )
    )
    setChats(chats)
    setCollections(collectionData.collections)
    setFolders(folders)
    setFiles(fileData.files)
    setPresets(presetData.presets)
    setPrompts(promptData.prompts)
    setTools(
      [...platformToolData, ...toolData.tools, ...publicToolData].filter(
        onlyUniqueById
      )
    )
    setPlatformTools(platformToolData)
    setModels(modelData.models)

    const parallelize = async (array: any, callback: any) => {
      const promises = array.map((item: any) => callback(item))
      return Promise.all(promises)
    }

    await parallelize(
      [...assistantData.assistants, ...publicAssistantData],
      async (assistant: any) => {
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
      }
    )

    setLoading(false)

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
  }

  if (loading) {
    return <Loading />
  }

  return <>{children}</>
}
