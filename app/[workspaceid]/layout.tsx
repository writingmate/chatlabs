"use client"

import { ChatbotUIContext } from "@/context/context"
import { getPublicAssistants } from "@/db/assistants"
import { getAssistantPublicImageUrl } from "@/db/storage/assistant-images"
import { getPublicTools, getToolWorkspacesByWorkspaceId } from "@/db/tools"
import { getWorkspaceById } from "@/db/workspaces"
import { supabase } from "@/lib/supabase/browser-client"
import { LLMID } from "@/types"
import { useParams, useRouter } from "next/navigation"
import { ReactNode, useContext, useEffect, useState } from "react"
import Loading from "../loading"
import { getPlatformTools } from "@/db/platform-tools"
import { onlyUniqueById } from "@/lib/utils"

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
    setFolders,
    setFiles,
    setPrompts,
    setTools,
    setPlatformTools,
    setModels,
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

  useEffect(
    () => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      setChatFiles,
      setChatImages,
      setChatMessages,
      setFirstTokenReceived,
      setIsGenerating,
      setNewMessageFiles,
      setNewMessageImages,
      setSelectedChat,
      setShowFilesDisplay,
      setUserInput,
      workspaceId
    ]
  )

  const fetchWorkspaceData = async (workspaceId: string) => {
    setLoading(true)

    try {
      const workspace = await getWorkspaceById(workspaceId)
      if (!workspace) {
        router.push("/")
        return
      }
      setSelectedWorkspace(workspace)

      const [publicAssistantData, publicToolData, platformToolData] =
        await Promise.all([
          getPublicAssistants(),
          getPublicTools(),
          getPlatformTools()
        ])

      setAssistants(
        [...workspace.assistants, ...publicAssistantData].filter(onlyUniqueById)
      )
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

      await parallelize(
        [...workspace.assistants, ...publicAssistantData],
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
    } catch (error) {
      console.error(error)
      router.push("/")
    }
  }

  if (loading) {
    return <Loading />
  }

  return <>{children}</>
}
