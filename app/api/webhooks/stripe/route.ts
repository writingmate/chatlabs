import type { Stripe } from "stripe"

import { NextResponse } from "next/server"

import { stripe } from "@/lib/stripe"
import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import { ACTIVE_PLAN_STATUSES, PLAN_FREE, PLANS } from "@/lib/stripe/config"
import { buffer } from "node:stream/consumers"
import {
  getProfileByStripeCustomerId,
  updateProfileByUserId
} from "@/db/profile"

export async function POST(req: Request) {
  let event: Stripe.Event
  let subscription: Stripe.Subscription

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // @ts-ignore
    const rawBody = await buffer(req.body)
    event = stripe.webhooks.constructEvent(
      rawBody,
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

  if (permittedEvents.includes(event.type)) {
    subscription = event.data.object as Stripe.Subscription

    const stripeCustomerId = subscription.customer as string

    const { data: profile, error } = await getProfileByStripeCustomerId(
      supabaseAdmin,
      stripeCustomerId
    )

    let userId = profile?.user_id

    if (!userId) {
      const customerResponse = await stripe.customers.retrieve(stripeCustomerId)

      const customer = customerResponse as Stripe.Customer

      console.log("customer", customer)

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: customer.email!,
        // password: "password",
        email_confirm: true
      })

      if (error) {
        console.log(error)
        return NextResponse.json(
          { message: "Webhook handler failed" },
          { status: 500 }
        )
      }

      await stripe.customers.update(stripeCustomerId, {
        metadata: {
          supabaseUUID: data.user!.id
        }
      })

      userId = data.user!.id

      await new Promise(r => setTimeout(r, 2000))
    }

    try {
      switch (event.type) {
        case "customer.subscription.deleted":
          await updateProfileByUserId(supabaseAdmin, userId, {
            stripe_customer_id: stripeCustomerId,
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
            await updateProfileByUserId(supabaseAdmin, userId, {
              stripe_customer_id: stripeCustomerId,
              plan
            })
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
