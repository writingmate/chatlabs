import { createClient } from "@supabase/supabase-js"
import { Database } from "@/supabase/types"
import { stripe } from "@/lib/stripe/stripe"
import { updateWorkspace } from "@/db/workspaces"
import { updateProfile } from "@/db/profile"
import { logger } from "@/lib/logger"

export const getOrCreateCustomer = async ({
  email,
  userId,
  workspaceId
}: {
  email: string
  userId: string
  workspaceId?: string
}) => {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // First check if user has workspace feature enabled
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("workspace_migration_enabled")
    .eq("user_id", userId)
    .single()

  if (profile?.workspace_migration_enabled) {
    // Workspace-based billing
    if (!workspaceId) {
      throw new Error("Workspace ID required for workspace-based billing")
    }

    const { data: workspace } = await supabaseAdmin
      .from("workspaces")
      .select("stripe_customer_id")
      .eq("id", workspaceId)
      .single()

    if (workspace?.stripe_customer_id) {
      return workspace.stripe_customer_id
    }

    // Create new customer for workspace
    const customer = await stripe.customers.create({
      email,
      metadata: {
        supabaseUUID: userId,
        workspaceId
      }
    })

    await supabaseAdmin
      .from("workspaces")
      .update({ stripe_customer_id: customer.id })
      .eq("id", workspaceId)

    logger.info(
      { workspaceId, customerId: customer.id },
      "Created Stripe customer for workspace"
    )

    return customer.id
  } else {
    // Legacy profile-based billing
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single()

    if (profile?.stripe_customer_id) {
      return profile.stripe_customer_id
    }

    // Create new customer for profile
    const customer = await stripe.customers.create({
      email,
      metadata: {
        supabaseUUID: userId
      }
    })

    await supabaseAdmin
      .from("profiles")
      .update({ stripe_customer_id: customer.id })
      .eq("user_id", userId)

    logger.info(
      { userId, customerId: customer.id },
      "Created Stripe customer for profile"
    )

    return customer.id
  }
}
