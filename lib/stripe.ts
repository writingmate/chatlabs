import "server-only"

import Stripe from "stripe"
import {
  getWorkspaceByStripeCustomerId,
  updateWorkspaceByStripeCustomerId
} from "@/db/workspaces"
import { createServiceRoleClient } from "./supabase/server"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: "2023-10-16"
})

// Update any functions that were using profiles to now use workspaces
// For example:
export async function updateWorkspacePlan(
  stripeCustomerId: string,
  plan: string
) {
  const supabaseAdmin = createServiceRoleClient()
  const { data: workspace, error } = await getWorkspaceByStripeCustomerId(
    supabaseAdmin,
    stripeCustomerId
  )

  if (error || !workspace) {
    throw new Error("Workspace not found")
  }

  await updateWorkspaceByStripeCustomerId(supabaseAdmin, stripeCustomerId, {
    plan
  })
}

// ... update other functions similarly
