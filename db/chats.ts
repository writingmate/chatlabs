import { supabase } from "@/lib/supabase/browser-client"
import { Tables, TablesInsert, TablesUpdate } from "@/supabase/types"

export const getChatById = async (chatId: string, client = supabase) => {
  const { data: chat } = await client
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .maybeSingle()

  return chat
}

export const getChatsByWorkspaceId = async (workspaceId: string) => {
  const { data: chats, error } = await supabase
    .from("chats")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  if (!chats) {
    throw new Error(error.message)
  }

  return chats
}

export const createChat = async (
  chat: TablesInsert<"chats">,
  client = supabase
) => {
  const { data: createdChat, error } = await client
    .from("chats")
    .insert([chat])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdChat
}

export const createChats = async (chats: TablesInsert<"chats">[]) => {
  const { data: createdChats, error } = await supabase
    .from("chats")
    .insert(chats)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  return createdChats
}

export const updateChat = async (
  chatId: string,
  chat: TablesUpdate<"chats">
) => {
  const { data: updatedChat, error } = await supabase
    .from("chats")
    .update(chat)
    .eq("id", chatId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedChat
}

export const deleteChat = async (chatId: string) => {
  const { error } = await supabase.from("chats").delete().eq("id", chatId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

// Add this new function at the end of the file

export const searchChatsAndMessages = async (
  workspaceId: string,
  query: string
): Promise<{ data: Tables<"chats">[] | null; error: any }> => {
  return await supabase.rpc("search_chats_and_messages", {
    p_workspace_id: workspaceId,
    p_query: query
  })
}

export const searchChatsByName = async (
  workspaceId: string,
  searchTerm: string,
  beforeCreatedAt?: string,
  offset: number = 0,
  limit: number = 40
): Promise<Tables<"chats">[]> => {
  // Start building the query
  let query = supabase
    .from("chats")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  // Add search term condition if provided
  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`)
  }

  // Add condition to fetch chats before a specific created_at timestamp
  if (!!beforeCreatedAt) {
    query = query.lte("created_at", beforeCreatedAt)
  }

  // Apply range for pagination
  query = query.range(offset, offset + limit - 1)

  const { data: chats, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return chats
}
