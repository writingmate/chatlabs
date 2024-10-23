import type { Stripe } from "stripe"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { ACTIVE_PLAN_STATUSES, PLAN_FREE } from "@/lib/stripe/config"
import { logger } from "@/lib/logger"
import { createErrorResponse } from "@/lib/response"

const supabaseAdmin = createServiceRoleClient()

const relevantEvents = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted"
])

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  logger.info("Received Stripe webhook request", {
    signature: signature?.substring(0, 10)
  })

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    logger.error({ err: error }, "Webhook signature verification failed")
    return createErrorResponse("Webhook signature verification failed", 400)
  }

  if (relevantEvents.has(event.type)) {
    try {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const plan = subscription.items.data[0].price.lookup_key

      logger.info(
        { customerId, plan, eventType: event.type },
        "Processing subscription event"
      )

      // First check if customer is associated with a workspace
      const { data: workspace } = await supabaseAdmin
        .from("workspaces")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single()

      if (workspace) {
        // Workspace-based billing
        if (event.type === "customer.subscription.deleted") {
          await supabaseAdmin
            .from("workspaces")
            .update({ plan: PLAN_FREE })
            .eq("stripe_customer_id", customerId)

          logger.info(
            { workspaceId: workspace.id },
            "Downgraded workspace to free plan"
          )
        } else if (ACTIVE_PLAN_STATUSES.includes(subscription.status)) {
          await supabaseAdmin
            .from("workspaces")
            .update({ plan })
            .eq("stripe_customer_id", customerId)

          logger.info(
            { workspaceId: workspace.id, plan },
            "Updated workspace plan"
          )
        }
      } else {
        // Legacy profile-based billing
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (!profile) {
          throw new Error(`No profile found for customer ${customerId}`)
        }

        if (event.type === "customer.subscription.deleted") {
          await supabaseAdmin
            .from("profiles")
            .update({ plan: PLAN_FREE })
            .eq("stripe_customer_id", customerId)

          logger.info(
            { userId: profile.user_id },
            "Downgraded profile to free plan"
          )
        } else if (ACTIVE_PLAN_STATUSES.includes(subscription.status)) {
          await supabaseAdmin
            .from("profiles")
            .update({ plan })
            .eq("stripe_customer_id", customerId)

          logger.info({ userId: profile.user_id, plan }, "Updated profile plan")
        }
      }
    } catch (error) {
      logger.error({ err: error }, "Webhook handler failed")
      return createErrorResponse("Webhook handler failed", 400)
    }
  }

  logger.info("Successfully processed webhook", { type: event.type })
  return NextResponse.json({ received: true })
}
