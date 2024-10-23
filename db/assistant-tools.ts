import { platformToolDefinitionById } from "@/db/platform-tools"
import { Tables, TablesInsert } from "@/supabase/types"

import { supabase } from "@/lib/supabase/browser-client"

export const getAssistantToolsByAssistantId = async (assistantId: string) => {
  const { data: assistantTools, error } = await supabase
    .from("assistants")
    .select(
      `
        id, 
        name, 
        tools (*),
        assistant_platform_tools (*)
      `
    )
    .eq("id", assistantId)
    .single()

  if (!assistantTools) {
    throw new Error(error.message)
  }

  const platformTools = await Promise.all(
    assistantTools.assistant_platform_tools.map(
      async tool => await platformToolDefinitionById(tool.tool_id)
    )
  )

  const allAssistantTools = (assistantTools.tools || []).concat(
    platformTools || []
  )

  return {
    tools: allAssistantTools,
    id: assistantTools.id,
    name: assistantTools.name
  }
}
async function insertAssistantTool(
  assistantTool: TablesInsert<"assistant_tools">
) {
  const { data, error } = await supabase
    .from("assistant_tools")
    .insert(assistantTool)
    .select("*")

  if (!data) {
    throw new Error(error.message)
  }

  return data
}

async function insertAssistantPlatformTool(
  assistantPlatformTool: TablesInsert<"assistant_platform_tools">
) {
  const { data, error } = await supabase
    .from("assistant_platform_tools")
    .insert(assistantPlatformTool)
    .select("*")

  if (!data) {
    throw new Error(error.message)
  }

  return data
}

export const createAssistantTool = async (
  assistantTool: TablesInsert<"assistant_tools">,
  isPlatformTool = false
) => {
  if (isPlatformTool) {
    return await insertAssistantPlatformTool(assistantTool)
  } else {
    return await insertAssistantTool(assistantTool)
  }
}
export const createAssistantTools = async (
  assistantTools: TablesInsert<"assistant_tools">[],
  tools: Tables<"tools">[]
) => {
  const createdAssistantUserTools = await Promise.all(
    assistantTools
      .filter(
        tool =>
          !tools.some(
            ptool => ptool.id === tool.tool_id && ptool.sharing === "platform"
          )
      )
      .map(async tool => await insertAssistantTool(tool))
  )
  const createdPlatformTools = await Promise.all(
    assistantTools
      .filter(tool =>
        tools.some(
          ptool => ptool.id === tool.tool_id && ptool.sharing === "platform"
        )
      )
      .map(async tool => await insertAssistantPlatformTool(tool))
  )

  return { createdAssistantUserTools, createdPlatformTools }
}

export const deleteAssistantTool = async (
  assistantId: string,
  toolId: string,
  isPlatformTool = false
) => {
  const tableName = isPlatformTool
    ? "assistant_platform_tools"
    : "assistant_tools"
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq("assistant_id", assistantId)
    .eq("tool_id", toolId)

  if (error) throw new Error(error.message)

  return true
}
