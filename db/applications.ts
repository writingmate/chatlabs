import { supabase } from "@/lib/supabase/browser-client"
import { Tables, TablesInsert, TablesUpdate } from "@/supabase/types"

export const getApplicationById = async (applicationId: string) => {
  const { data: application, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .single()

  if (!application) {
    throw new Error(error.message)
  }

  return application
}

export const getApplicationsByWorkspaceId = async (workspaceId: string) => {
  const { data: applications, error } = await supabase
    .from("applications")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  if (!applications) {
    throw new Error(error.message)
  }

  return applications
}

export const createApplication = async (
  application: TablesInsert<"applications">,
  files: string[],
  tools: string[]
) => {
  const { data: createdApplication, error } = await supabase
    .from("applications")
    .insert([application])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (files.length > 0) {
    await createApplicationFiles(
      files.map(fileId => ({
        user_id: application.user_id,
        application_id: createdApplication.id,
        file_id: fileId
      }))
    )
  }

  if (tools.length > 0) {
    await createApplicationTools(
      tools.map(toolId => ({
        user_id: application.user_id,
        application_id: createdApplication.id,
        tool_id: toolId
      }))
    )
  }

  return createdApplication
}

export const updateApplication = async (
  applicationId: string,
  application: TablesUpdate<"applications">
) => {
  const { data: updatedApplication, error } = await supabase
    .from("applications")
    .update(application)
    .eq("id", applicationId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedApplication
}

export const deleteApplication = async (applicationId: string) => {
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const createApplicationFiles = async (
  items: { user_id: string; application_id: string; file_id: string }[]
) => {
  const { data: createdApplicationFiles, error } = await supabase
    .from("application_files")
    .insert(items)
    .select("*")

  if (error) throw new Error(error.message)

  return createdApplicationFiles
}

export const createApplicationTools = async (
  items: { user_id: string; application_id: string; tool_id: string }[]
) => {
  const { data: createdApplicationTools, error } = await supabase
    .from("application_tools")
    .insert(items)
    .select("*")

  if (error) throw new Error(error.message)

  return createdApplicationTools
}

export const getApplicationFiles = async (applicationId: string) => {
  const { data: applicationFiles, error } = await supabase
    .from("application_files")
    .select("files(*)")
    .eq("application_id", applicationId)

  if (error) throw new Error(error.message)

  return applicationFiles.map(item => item.files)
}

export const getApplicationTools = async (applicationId: string) => {
  const { data: applicationTools, error } = await supabase
    .from("application_tools")
    .select("tools(*)")
    .eq("application_id", applicationId)

  if (error) throw new Error(error.message)

  return applicationTools.map(item => item.tools)
}
