import { supabase } from "@/lib/supabase/browser-client"
import { Database, Tables, TablesInsert, TablesUpdate } from "@/supabase/types"
import { LLM, LLMID } from "@/types"
import { SupabaseClient } from "@supabase/supabase-js"
import { getPlatformTools, platformToolDefinitionById } from "./platform-tools"

export const getApplicationById = async (
  applicationId: string,
  client: SupabaseClient<Database> = supabase
) => {
  const { data: application, error } = await client
    .from("applications")
    .select(
      "*, files(*), tools(*), application_models(*), application_platform_tools(*)"
    )
    .eq("id", applicationId)
    .single()

  const applicationModels = application?.application_models.map(
    model => model.model_id
  )

  if (!application) {
    throw new Error(error.message)
  }

  return {
    ...application,
    models: applicationModels,
    tools: [
      ...application.tools,
      ...(await Promise.all(
        application.application_platform_tools.map(
          async tool => await platformToolDefinitionById(tool.platform_tool_id)
        )
      ))
    ]
  } as Tables<"applications"> & {
    models: LLMID[]
    tools: Tables<"tools">[]
  }
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
  models: string[],
  tools: string[],
  platformTools: string[]
) => {
  // @ts-ignore
  delete application.tools
  // @ts-ignore
  delete application.models
  // @ts-ignore
  delete application.id

  const { data: createdApplication, error } = await supabase
    .from("applications")
    .insert([
      {
        ...application
      }
    ])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (models.length > 0) {
    await createApplicationModels(
      models.map(modelId => ({
        // user_id: application.user_id,
        application_id: createdApplication.id,
        model_id: modelId
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

  if (platformTools.length > 0) {
    await createApplicationPlatformTools(
      platformTools.map(toolId => ({
        user_id: application.user_id,
        application_id: createdApplication.id,
        platform_tool_id: toolId
      }))
    )
  }
  return createdApplication
}

export const updateApplication = async (
  applicationId: string,
  application: TablesUpdate<"applications">,
  tools: string[],
  platformTools: string[],
  models: string[]
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

  // Update tools
  if (tools.length > 0 || platformTools.length > 0) {
    console.log("Updating tools", tools, platformTools)
    await updateApplicationTools(
      tools.map(toolId => ({
        user_id: application.user_id!,
        application_id: applicationId,
        tool_id: toolId
      })),
      platformTools.map(toolId => ({
        user_id: application.user_id!,
        application_id: applicationId,
        platform_tool_id: toolId
      }))
    )
  }

  // Update models
  await updateApplicationModels(applicationId, models)

  return updatedApplication
}

const updateApplicationTools = async (
  tools: TablesInsert<"application_tools">[],
  platformTools: TablesInsert<"application_platform_tools">[]
) => {
  const applicationId =
    tools?.[0]?.application_id || platformTools?.[0]?.application_id

  if (!applicationId) {
    throw new Error("Application ID is required")
  }

  // Remove existing tools

  // Add new tools
  if (tools.length > 0) {
    const { error: toolsDeleteError } = await supabase
      .from("application_tools")
      .delete()
      .eq("application_id", applicationId)

    if (toolsDeleteError) {
      throw new Error(toolsDeleteError.message)
    }

    const { error: toolsError } = await supabase
      .from("application_tools")
      .insert(tools)

    if (toolsError) {
      throw new Error(toolsError.message)
    }
  }

  // Add new platform tools
  if (platformTools.length > 0) {
    const { error: platformToolsDeleteError } = await supabase
      .from("application_platform_tools")
      .delete()
      .eq("application_id", applicationId)

    if (platformToolsDeleteError) {
      throw new Error(platformToolsDeleteError.message)
    }

    const { error: platformToolsError } = await supabase
      .from("application_platform_tools")
      .insert(platformTools)

    if (platformToolsError) {
      throw new Error(platformToolsError.message)
    }
  }
}

const updateApplicationModels = async (
  applicationId: string,
  models: string[]
) => {
  // Remove existing models
  await supabase
    .from("application_models")
    .delete()
    .eq("application_id", applicationId)

  // Add new models
  const modelsToInsert = models.map(model => ({
    application_id: applicationId,
    model_id: model
  }))

  const { error } = await supabase
    .from("application_models")
    .insert(modelsToInsert)

  if (error) {
    throw new Error(error.message)
  }
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
  items: TablesInsert<"application_files">[]
) => {
  const { data: createdApplicationFiles, error } = await supabase
    .from("application_files")
    .insert(items)
    .select("*")

  if (error) throw new Error(error.message)

  return createdApplicationFiles
}

export const createApplicationPlatformTools = async (
  items: TablesInsert<"application_platform_tools">[]
) => {
  const { data: createdApplicationPlatformTools, error } = await supabase
    .from("application_platform_tools")
    .insert(items)
    .select("*")

  if (error) throw new Error(error.message)

  return createdApplicationPlatformTools
}

export const createApplicationTools = async (
  items: TablesInsert<"application_tools">[]
) => {
  const { data: createdApplicationTools, error } = await supabase
    .from("application_tools")
    .insert(items)
    .select("*")

  if (error) throw new Error(error.message)

  return createdApplicationTools
}

export const createApplicationModels = async (
  items: TablesInsert<"application_models">[]
) => {
  const { data: createdApplicationModels, error } = await supabase
    .from("application_models")
    .insert(items)
    .select("*")

  if (error) throw new Error(error.message)

  return createdApplicationModels
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

  return applicationTools.map(item => item.tools).filter(tool => tool !== null)
}

// Add this function to update the chat_id for an application
export async function updateApplicationChatId(
  applicationId: string,
  chatId: string,
  client: SupabaseClient<Database> = supabase
) {
  const { data, error } = await client
    .from("applications")
    .update({ chat_id: chatId })
    .eq("id", applicationId)
    .single()

  if (error) {
    console.error("Error updating application chat_id:", error)
    throw error
  }

  return data
}
