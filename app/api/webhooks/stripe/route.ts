import { buffer } from "node:stream/consumers"
import { NextResponse } from "next/server"
import {
  getProfileByStripeCustomerId,
  updateProfileByUserId
} from "@/db/profile"
import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import type { Stripe } from "stripe"

import { logger } from "@/lib/logger"
import { createErrorResponse } from "@/lib/response"
import { stripe } from "@/lib/stripe"
import { ACTIVE_PLAN_STATUSES, PLAN_FREE, PLANS } from "@/lib/stripe/config"

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  let event: Stripe.Event
  let subscription: Stripe.Subscription

  try {
    const rawBody = await buffer(
      req.body as unknown as AsyncIterable<Uint8Array>
    )
    event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    logger.error({ err: err }, `❌ Error parsing webhook: ${errorMessage}`)
    return createErrorResponse(`Webhook Error: ${errorMessage}`, 400)
  }

  logger.info(`[${event.id}][${event.type}]: Event received`)

  const permittedEvents = [
    "customer.subscription.deleted",
    "customer.subscription.updated",
    "customer.subscription.created"
  ]

  if (!permittedEvents.includes(event.type)) {
    return NextResponse.json(
      { message: "Unhandled event type" },
      { status: 200 }
    )
  }

  subscription = event.data.object as Stripe.Subscription
  const stripeCustomerId = subscription.customer as string

  try {
    const { data: profile } = await getProfileByStripeCustomerId(
      supabaseAdmin,
      stripeCustomerId
    )

    if (!profile) {
      throw new Error(
        `Profile not found for Stripe customer ${stripeCustomerId}`
      )
    }

    let plan = PLAN_FREE
    if (event.type !== "customer.subscription.deleted") {
      const status = subscription.status
      const planFromSubscription = subscription.items.data[0].price.lookup_key!
      if (
        ACTIVE_PLAN_STATUSES.includes(status) &&
        PLANS.includes(planFromSubscription)
      ) {
        plan = planFromSubscription
      }
    }

    await updateProfileByUserId(supabaseAdmin, profile.user_id, {
      stripe_customer_id: stripeCustomerId,
      plan
    })

    logger.info(
      `[${event.id}][${event.type}]: Profile updated with plan ${plan}`
    )
  } catch (error) {
    logger.error(
      { err: error },
      `[${event.id}][${event.type}]: Error processing webhook:`
    )
    return createErrorResponse("Webhook processing failed", 500)
  }

  return NextResponse.json(
    { message: "Webhook processed successfully" },
    { status: 200 }
  )
}
