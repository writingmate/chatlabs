import type { Stripe } from "stripe"

import { NextResponse } from "next/server"

import { stripe } from "@/lib/stripe"
import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import { ACTIVE_PLAN_STATUSES, PLAN_FREE, PLANS } from "@/lib/stripe/config"

export async function POST(req: Request) {
  let event: Stripe.Event
  let subscription: Stripe.Subscription

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    console.log(`❌ Error message: ${errorMessage}`)
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    )
  }

  console.log("✅ Success:", event.id)

  const permittedEvents: string[] = [
    "customer.subscription.deleted",
    "customer.subscription.updated",
    "customer.subscription.created"
  ]

  async function updateProfileByStripeCustomerId(
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

  if (permittedEvents.includes(event.type)) {
    const subscription = event.data.object as Stripe.Subscription

    const stripeCustomerId = subscription.customer as string

    try {
      switch (event.type) {
        case "customer.subscription.deleted":
          await updateProfileByStripeCustomerId(stripeCustomerId, {
            plan: PLAN_FREE
          })
          break
        case "customer.subscription.created":
        case "customer.subscription.updated":
          const status = subscription.status
          let plan = subscription.items.data?.[0]?.price?.lookup_key
          if (!plan || !PLANS.includes(plan)) {
            plan = PLAN_FREE
          }
          if (ACTIVE_PLAN_STATUSES.includes(status)) {
            await updateProfileByStripeCustomerId(stripeCustomerId, { plan })
          }
          break
      }
    } catch (error) {
      console.log(error)
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 }
      )
    }
  }
  return NextResponse.json({ message: "Received" }, { status: 200 })
}
