"use server"

import type { Stripe } from "stripe"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { getOrCreateCustomer } from "@/lib/stripe/get-or-create-customer"
import { PLANS } from "@/lib/stripe/config"
import { redirect } from "next/navigation"
import { getServerProfile } from "@/lib/server/server-chat-helpers"

export async function createCheckoutSession(
  data: FormData
): Promise<{ client_secret: string | null; url: string | null }> {
  try {
    const plan = data.get("plan") as string
    console.log("Received plan:", plan)
    console.log("Available plans:", PLANS)

    if (!PLANS.includes(plan)) {
      console.error(`Plan "${plan}" is not included in PLANS array`)
      throw new Error("Invalid plan")
    }

    const userId = data.get("userId") as string
    const email = data.get("email") as string

    if (!userId || !email || !plan) {
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
      userId
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
        success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/subscription/cancel`
      })

    return {
      client_secret: checkoutSession.client_secret,
      url: checkoutSession.url
    }
  } catch (error) {
    console.error("Error in createCheckoutSession:", error)
    throw error // Re-throw the error to be handled by the caller
  }
}

export async function createBillingPortalSession(customerId: string) {
  try {
    const origin = headers().get("origin")
    if (!origin) {
      throw new Error("Origin header is missing")
    }

    const billingPortalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
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

export async function redirectToBillingPortal() {
  let redirectTo = headers().get("referer") || "/"
  try {
    const profile = await getServerProfile()
    if (!profile?.stripe_customer_id) {
      throw new Error("User does not have a Stripe customer ID")
    }
    const { url } = await createBillingPortalSession(profile.stripe_customer_id)
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
