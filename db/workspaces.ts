import { supabase } from "@/lib/supabase/browser-client"
import { Tables, TablesInsert, TablesUpdate } from "@/supabase/types"
import { SupabaseClient } from "@supabase/supabase-js"

export const getHomeWorkspaceByUserId = async (
  userId: string,
  client = supabase
) => {
  const { data: homeWorkspace, error } = await client
    .from("workspaces")
    .select("*")
    .eq("user_id", userId)
    .eq("is_home", true)
    .single()

  if (!homeWorkspace) {
    throw new Error(error.message)
  }

  return homeWorkspace.id
}

export const getWorkspaceById = async (
  workspaceId: string,
  client = supabase
) => {
  const { data: workspace, error } = await client
    .from("workspaces")
    .select(
      `*, 
    chats(*),
    assistants(*), 
    folders(*), 
    files(*), 
    presets(*), 
    prompts(*), 
    tools(*), 
    models(*)`
    )
    .eq("id", workspaceId)
    .single()

  if (!workspace) {
    throw new Error(error.message)
  }

  return workspace
}

export const getWorkspacesByUserId = async (userId: string) => {
  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (!workspaces) {
    throw new Error(error.message)
  }

  return workspaces
}

export const createWorkspace = async (
  workspace: TablesInsert<"workspaces">
) => {
  const { data: createdWorkspace, error } = await supabase
    .from("workspaces")
    .insert([workspace])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdWorkspace
}

export const updateWorkspace = async (
  workspaceId: string,
  workspace: TablesUpdate<"workspaces">
) => {
  const { data: updatedWorkspace, error } = await supabase
    .from("workspaces")
    .update(workspace)
    .eq("id", workspaceId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedWorkspace
}

export const deleteWorkspace = async (workspaceId: string) => {
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const getWorkspaceUsers = async (
  workspaceId: string
): Promise<Tables<"workspace_users">[]> => {
  const { data, error } = await supabase
    .from("workspace_users")
    .select("user_id, email, role, status")
    .eq("workspace_id", workspaceId)

  if (error) {
    console.error("Error fetching workspace users:", error)
    throw error
  }

  return data as Tables<"workspace_users">[]
}

export const getWorkspaces = async (
  workspaceId?: string
): Promise<Tables<"workspaces">[]> => {
  const query = supabase.from("workspaces").select("*")

  if (workspaceId) {
    query.eq("id", workspaceId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching workspaces:", error)
    throw error
  }

  return data as Tables<"workspaces">[]
}

export async function updateWorkspaceUserRole(
  workspaceId: string,
  userId: string,
  newRole: "OWNER" | "MEMBER"
) {
  const { data, error } = await supabase
    .from("workspace_users")
    .update({ role: newRole })
    .match({ workspace_id: workspaceId, user_id: userId })

  if (error) throw error
  return data
}

export async function removeWorkspaceUser(workspaceId: string, userId: string) {
  const { data, error } = await supabase
    .from("workspace_users")
    .delete()
    .match({ workspace_id: workspaceId, user_id: userId })

  if (error) throw error
  return data
}

export const getPendingInvites = async (
  userId: string
): Promise<
  (Tables<"workspace_users"> & { workspaces: Tables<"workspaces"> | null })[]
> => {
  const { data, error } = await supabase
    .from("workspace_users")
    .select("*, workspaces(*)")
    .eq("user_id", userId)
    .eq("status", "PENDING")

  if (error) {
    console.error("Error fetching pending invites:", error)
    throw error
  }

  return data
}

export const acceptInvite = async (
  workspaceId: string,
  userId: string
): Promise<Tables<"workspaces">> => {
  // First, update the workspace_users status to "accepted"
  const { error: updateError } = await supabase
    .from("workspace_users")
    .update({ status: "ACTIVE" })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)

  if (updateError) {
    console.error("Error accepting invite:", updateError)
    throw updateError
  }

  // Then, fetch the workspace details
  const { data: workspace, error: fetchError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single()

  if (fetchError) {
    console.error(
      "Error fetching workspace after accepting invite:",
      fetchError
    )
    throw fetchError
  }

  return workspace as Tables<"workspaces">
}

// Add these new functions
export async function updateWorkspaceByStripeCustomerId(
  supabaseAdmin: SupabaseClient,
  stripeCustomerId: string,
  workspace: TablesUpdate<"workspaces">
) {
  return supabaseAdmin
    .from("workspaces")
    .update(workspace)
    .eq("stripe_customer_id", stripeCustomerId)
    .select("*")
    .single()
}

export async function getWorkspaceByStripeCustomerId(
  supabaseAdmin: SupabaseClient,
  stripeCustomerId: string
) {
  return supabaseAdmin
    .from("workspaces")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .single()
}
