"use server"

import type { Stripe } from "stripe"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { getOrCreateCustomer } from "@/lib/stripe/get-or-create-customer"
import { PLANS } from "@/lib/stripe/config"
import { redirect } from "next/navigation"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function createCheckoutSession(
  data: FormData
): Promise<{ client_secret: string | null; url: string | null }> {
  try {
    const plan = data.get("plan") as string
    const userId = data.get("userId") as string
    const email = data.get("email") as string
    const workspaceId = data.get("workspaceId") as string

    if (!userId || !email || !plan || !workspaceId) {
      throw new Error("Missing required fields")
    }

    const origin = headers().get("origin")
    if (!origin) {
      throw new Error("Origin header is missing")
    }

    if (!PLANS.includes(plan)) {
      throw new Error(`Invalid plan: ${plan}`)
    }

    const prices = await stripe.prices.list({
      lookup_keys: [plan],
      active: true
    })

    if (prices.data.length === 0) {
      throw new Error(`No active price found for plan: ${plan}`)
    }

    const customerId = await getOrCreateCustomer({
      email,
      userId,
      workspaceId
    })

    const price = prices.data[0].id

    const checkoutSession: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        allow_promotion_codes: true,
        line_items: [
          {
            price: price,
            quantity: 1
          }
        ],
        metadata: {
          workspaceId // Add workspaceId to metadata for webhook handling
        },
        success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/subscription/cancel`
      })

    return {
      client_secret: checkoutSession.client_secret,
      url: checkoutSession.url
    }
  } catch (error) {
    console.error("Error in createCheckoutSession:", error)
    throw error
  }
}

export async function createBillingPortalSession(workspaceId: string) {
  try {
    const origin = headers().get("origin")
    if (!origin) {
      throw new Error("Origin header is missing")
    }

    const supabase = createServiceRoleClient()
    const { data: workspace, error } = await supabase
      .from("workspaces")
      .select("stripe_customer_id")
      .eq("id", workspaceId)
      .single()

    if (error || !workspace?.stripe_customer_id) {
      throw new Error("Workspace not found or no Stripe customer ID")
    }

    const billingPortalSession = await stripe.billingPortal.sessions.create({
      customer: workspace.stripe_customer_id,
      return_url: origin
    })

    return {
      url: billingPortalSession.url
    }
  } catch (error) {
    console.error("Error in createBillingPortalSession:", error)
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
