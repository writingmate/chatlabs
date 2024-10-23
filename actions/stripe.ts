"use server"

import type { Stripe } from "stripe"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { getOrCreateCustomer } from "@/lib/stripe/get-or-create-customer"
import { PLANS } from "@/lib/stripe/config"
import { redirect } from "next/navigation"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import { createCheckoutSession as createStripeCheckoutSession } from "@/lib/stripe/create-checkout"

export async function createCheckoutSession(
  data: FormData
): Promise<{ client_secret: string | null; url: string | null }> {
  try {
    const plan = data.get("plan") as string
    const userId = data.get("userId") as string
    const email = data.get("email") as string
    const workspaceId = data.get("workspaceId") as string

    if (!userId || !email || !plan) {
      throw new Error("Missing required fields")
    }

    const origin = headers().get("origin")
    if (!origin) {
      throw new Error("Origin header is missing")
    }

    const prices = await stripe.prices.list({
      lookup_keys: [plan],
      expand: ["data.product"]
    })

    if (!prices.data.length) {
      throw new Error("Price not found")
    }

    const customerId = await getOrCreateCustomer({
      email,
      userId,
      workspaceId // Optional - only passed for workspace-based billing
    })

    const price = prices.data[0].id

    try {
      const session = await createStripeCheckoutSession({
        customerId,
        priceId: price,
        origin,
        metadata: workspaceId ? { workspaceId } : undefined
      })

      if (!session.url) {
        throw new Error("No checkout URL returned")
      }

      logger.info({ url: session.url }, "Redirecting to checkout")
      return {
        url: session.url,
        client_secret: session.client_secret || null // Add this line
      }
    } catch (error) {
      logger.error({ err: error }, "Failed to create checkout session")
      throw error
    }
  } catch (error) {
    logger.error({ err: error }, "Error in createCheckoutSession")
    throw error
  }
}

export async function createBillingPortalSession(workspaceId?: string): Promise<{
  client_secret: string | null
  url: string | null
}> {
  try {
    const origin = headers().get("origin")
    if (!origin) {
      throw new Error("Origin header is missing")
    }

    const supabase = createServiceRoleClient()

    let customerId: string

    if (workspaceId) {
      // Workspace-based billing
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("stripe_customer_id")
        .eq("id", workspaceId)
        .single()

      if (!workspace?.stripe_customer_id) {
        throw new Error("No Stripe customer ID found for workspace")
      }

      customerId = workspace.stripe_customer_id
    } else {
      // Legacy profile-based billing - we need user_id from auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        throw new Error("No authenticated user found")
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .single()

      if (!profile?.stripe_customer_id) {
        throw new Error("No Stripe customer ID found for profile")
      }

      customerId = profile.stripe_customer_id
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: origin
    })

    return {
      client_secret: null,
      url: portalSession.url
    }
  } catch (error) {
    logger.error({ err: error }, "Error creating billing portal session")
    throw error
  }
}

export async function redirectToBillingPortal(workspaceId: string) {
  let redirectTo = headers().get("referer") || "/"
  try {
    const supabase = createServiceRoleClient()

    // Get the workspace details
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("stripe_customer_id, id")
      .eq("id", workspaceId)
      .single()

    if (!workspace?.stripe_customer_id) {
      throw new Error("Workspace does not have a Stripe customer ID")
    }

    const { url } = await createBillingPortalSession(workspace.id)
    if (!url) {
      throw new Error("Failed to create billing portal session")
    }
    redirectTo = url
  } catch (error) {
    console.error("Error in redirectToBillingPortal:", error)
    // Handle the error appropriately, e.g., redirect to an error page
  }
  redirect(redirectTo)
}
