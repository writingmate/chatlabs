import { Tables } from "@/supabase/types"
import { t } from "i18next"

let platformToolList: Tables<"tools">[] | null = null
export const getPlatformTools = async () => {
  if (platformToolList) {
    return platformToolList
  }

  const response = await fetch("/api/chat/tools")

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const tools = await response.json()

  platformToolList = tools

  return tools as Tables<"tools">[]
}

export const platformToolDefinitionById = async (id: string) => {
  const tool = (await getPlatformTools()).find(tool => tool.id === id)

  if (!tool) {
    throw new Error(t("Tool not found"))
  }

  return tool
}
