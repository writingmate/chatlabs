import { supabase } from "@/lib/supabase/browser-client"
import { Database, TablesInsert, TablesUpdate } from "@/supabase/types"
import { SupabaseClient } from "@supabase/supabase-js"

export const getProfileByUserId = async (
  userId: string,
  supabaseClient?: SupabaseClient
) => {
  const client = supabaseClient || supabase
  const { data: profile, error } = await client
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (!profile || error) {
    throw new Error(error?.message || "Profile not found")
  }

  return profile
}

export const getProfilesByUserId = async (userId: string) => {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)

  if (!profiles) {
    throw new Error(error.message)
  }

  return profiles
}

export const createProfile = async (profile: TablesInsert<"profiles">) => {
  const { data: createdProfile, error } = await supabase
    .from("profiles")
    .insert([profile])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdProfile
}

export const updateProfile = async (
  profileId: string,
  profile: TablesUpdate<"profiles">
) => {
  const { data: updatedProfile, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", profileId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedProfile
}

export const deleteProfile = async (profileId: string) => {
  const { error } = await supabase.from("profiles").delete().eq("id", profileId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export async function updateProfileByStripeCustomerId(
  supabaseAdmin: SupabaseClient,
  stripeCustomerId: string,
  profile: Database["public"]["Tables"]["profiles"]["Update"]
) {
  return supabaseAdmin
    .from("profiles")
    .update(profile)
    .eq("stripe_customer_id", stripeCustomerId)
    .select("*")
    .single()
}

export async function getProfileByStripeCustomerId(
  supabaseAdmin: SupabaseClient,
  stripeCustomerId: string
) {
  return supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .single()
}

export function updateProfileByUserId(
  supabaseAdmin: SupabaseClient,
  userId: string,
  profile: Database["public"]["Tables"]["profiles"]["Update"]
) {
  return supabaseAdmin
    .from("profiles")
    .update(profile)
    .eq("user_id", userId)
    .select("*")
    .single()
}
