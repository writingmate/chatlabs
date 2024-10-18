import { supabase } from "@/lib/supabase/browser-client"
import { Database, TablesInsert, TablesUpdate } from "@/supabase/types"
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
  const { data: workspaceProfile, error: workspaceProfileError } =
    await supabase
      .from("workspace_profiles")
      .select(`*`)
      .eq("user_id", userId)
      .single()

  if (!workspaceProfile) {
    throw new Error(workspaceProfileError.message)
  }

  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceProfile.workspace_id)
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
  // Do not send data related to the pivot tables
  // Otherwise the request will fail
  const modifiedWorkspace = {
    ...workspace,
    chats: undefined,
    assistants: undefined,
    folders: undefined,
    files: undefined,
    presets: undefined,
    prompts: undefined,
    tools: undefined,
    models: undefined
  }
  const { data: updatedWorkspace, error } = await supabase
    .from("workspaces")
    .update(modifiedWorkspace)
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

export async function updateWorkspaceByStripeCustomerId(
  supabaseAdmin: SupabaseClient,
  stripeCustomerId: string,
  profile: Database["public"]["Tables"]["workspaces"]["Update"]
) {
  return supabaseAdmin
    .from("workspaces")
    .update(profile)
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

export function updateWorkspaceById(
  supabaseAdmin: SupabaseClient,
  workspaceId: string,
  workspace: Database["public"]["Tables"]["workspaces"]["Update"]
) {
  return supabaseAdmin
    .from("workspaces")
    .update(workspace)
    .eq("id", workspaceId)
    .select("*")
    .single()
}
