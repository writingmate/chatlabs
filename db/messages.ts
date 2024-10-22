import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getMessageById = async (messageId: string) => {
  const { data: message } = await supabase
    .from("messages")
    .select("*")
    .eq("id", messageId)
    .single()

  if (!message) {
    throw new Error("Message not found")
  }

  return message
}

export const getMessageCountForModel = async (
  userId: string,
  model: string,
  date?: Date,
  client = supabase
) => {
  if (!date) {
    date = new Date()
  }

  const { data, error } = await client
    .from("daily_message_count")
    .select("count")
    .eq("user_id", userId)
    .eq("model_id", model)
    .eq("day", date.toISOString().split("T")[0])

  if (error) {
    console.error("Error fetching daily message count:", error)
    throw new Error("Could not fetch message count")
  }

  return data?.[0]?.count || 0
}

export const getMessageCount = async (since?: Date) => {
  if (!since) {
    // one day ago
    since = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
  }

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .gt("created_at", since.toISOString())
    .eq("role", "user")

  if (error) {
    throw new Error(error.message)
  }

  return count
}

export const getMessagesByChatId = async (chatId: string) => {
  const { data: messages } = await supabase
    .from("messages")
    .select("*, file_items (*)")
    .eq("chat_id", chatId)

  if (!messages) {
    throw new Error("Messages not found")
  }

  return messages
}

export const createMessage = async (
  message: TablesInsert<"messages">,
  client = supabase
) => {
  const { data: createdMessage, error } = await client
    .from("messages")
    .insert([message])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdMessage
}

export const createMessages = async (
  messages: TablesInsert<"messages">[],
  client = supabase
) => {
  const { data: createdMessages, error } = await client
    .from("messages")
    .insert(messages)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  return createdMessages
}

export const updateMessage = async (
  messageId: string,
  message: TablesUpdate<"messages">
) => {
  const { data: updatedMessage, error } = await supabase
    .from("messages")
    .update(message)
    .eq("id", messageId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedMessage
}

export const deleteMessage = async (messageId: string) => {
  const { error } = await supabase.from("messages").delete().eq("id", messageId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export async function deleteMessagesIncludingAndAfter(
  userId: string,
  chatId: string,
  sequenceNumber: number
) {
  const { error } = await supabase.rpc("delete_messages_including_and_after", {
    p_user_id: userId,
    p_chat_id: chatId,
    p_sequence_number: sequenceNumber
  })

  if (error) {
    return {
      error: "Failed to delete messages."
    }
  }

  return true
}
