"use client"

import React, { useState, useContext, useCallback } from "react"
import { Tables, TablesInsert } from "@/supabase/types"
import { LLMID } from "@/types"
import { ChatbotUIContext } from "@/context/context"
import { createApplication } from "@/db/applications"
import { UpdateApplication } from "./update-application"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { IconPlus } from "@tabler/icons-react"

export const CreateApplicationPage: React.FC = () => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [application, setApplication] = useState<
    TablesInsert<"applications"> & {
      tools: Tables<"tools">[]
      models: LLMID[]
    }
  >({
    name: "Untitled Application",
    description: "",
    sharing: "private",
    theme: "light",
    application_type: "web_app",
    user_id: profile?.user_id || "",
    workspace_id: selectedWorkspace?.id || "",
    tools: [],
    models: []
  })

  const handleUpdateApplication = useCallback(
    (
      updatedApplication: TablesInsert<"applications"> & {
        tools: Tables<"tools">[]
        models: LLMID[]
      }
    ) => {
      setApplication(updatedApplication)
    },
    []
  )

  const handleCreateApplication = useCallback(async () => {
    if (!profile || !selectedWorkspace) return

    try {
      setLoading(true)
      const platformTools = application.tools.filter(
        tool => tool.sharing === "platform"
      )
      const selectedPlatformTools = platformTools.filter(tool =>
        platformTools.find(platformTool => platformTool.id === tool.id)
      )
      const filteredSelectedTools = application.tools.filter(
        tool =>
          !selectedPlatformTools.find(
            platformTool => platformTool.id === tool.id
          )
      )

      const createdApplication = await createApplication(
        {
          ...application,
          user_id: profile.user_id,
          workspace_id: selectedWorkspace.id
        },
        application.models,
        filteredSelectedTools.map(tool => tool.id),
        selectedPlatformTools.map(tool => tool.id)
      )

      toast.success("Application created successfully")
      router.push(`/applications/${createdApplication.id}`)
    } catch (error) {
      console.error("Error creating application:", error)
      toast.error("Failed to create application")
    } finally {
      setLoading(false)
    }
  }, [application, profile, selectedWorkspace, router])

  return (
    <div className="mx-auto flex h-full min-w-[600px] max-w-xl grow flex-col space-y-4 overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold ">Create Application</div>
        <Button loading={loading} onClick={handleCreateApplication}>
          <IconPlus className="mr-2 size-4" /> Create
        </Button>
      </div>
      <UpdateApplication
        // @ts-ignore
        application={application}
        onUpdateApplication={handleUpdateApplication}
        isCreating={true}
      />
    </div>
  )
}
