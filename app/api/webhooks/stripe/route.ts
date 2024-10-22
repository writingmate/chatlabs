import type { Stripe } from "stripe"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import { ACTIVE_PLAN_STATUSES, PLAN_FREE, PLANS } from "@/lib/stripe/config"
import { updateWorkspaceByStripeCustomerId } from "@/db/workspaces"
import { createErrorResponse } from "@/lib/response"
import { logger } from "@/lib/logger"

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const relevantEvents = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted"
])

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  logger.info("Received Stripe webhook request", {
    signature: signature?.substring(0, 10), // Log only first 10 chars for security
    bodyLength: body.length
  })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    logger.info("Successfully constructed Stripe event", {
      type: event.type,
      id: event.id
    })
  } catch (error) {
    logger.error({ err: error }, "Webhook signature verification failed")
    return createErrorResponse("Webhook signature verification failed", 400)
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
          const subscription = event.data.object as Stripe.Subscription
          logger.info("Processing subscription event", {
            eventType: event.type,
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            status: subscription.status
          })

          // Get the plan from the subscription
          const plan = subscription.items.data[0].price.lookup_key
          logger.debug("Extracted plan from subscription", {
            plan,
            priceId: subscription.items.data[0].price.id
          })

          if (!plan || !PLANS.includes(plan as string)) {
            logger.error("Invalid plan detected", { plan })
            throw new Error("Invalid plan")
          }

          // Update the workspace with the new plan if subscription is active
          if (ACTIVE_PLAN_STATUSES.includes(subscription.status)) {
            logger.info("Updating workspace plan", {
              customerId: subscription.customer,
              plan,
              status: subscription.status
            })

            const { data, error } = await updateWorkspaceByStripeCustomerId(
              supabaseAdmin,
              subscription.customer as string,
              { plan }
            )

            if (error) {
              logger.error("Failed to update workspace", {
                error,
                customerId: subscription.customer
              })
              throw error
            }

            logger.info("Successfully updated workspace plan", {
              workspaceId: data?.id,
              plan
            })
          }
          break

        case "customer.subscription.deleted":
          const deletedSubscription = event.data.object as Stripe.Subscription
          logger.info("Processing subscription deletion", {
            subscriptionId: deletedSubscription.id,
            customerId: deletedSubscription.customer
          })

          // Set the workspace plan back to free
          const { data: updatedWorkspace, error: deleteError } =
            await updateWorkspaceByStripeCustomerId(
              supabaseAdmin,
              deletedSubscription.customer as string,
              { plan: PLAN_FREE }
            )

          if (deleteError) {
            logger.error("Failed to update workspace to free plan", {
              error: deleteError,
              customerId: deletedSubscription.customer
            })
            throw deleteError
          }

          logger.info("Successfully downgraded workspace to free plan", {
            workspaceId: updatedWorkspace?.id,
            customerId: deletedSubscription.customer
          })
          break

        default:
          logger.warn("Unhandled relevant event", { type: event.type })
          throw new Error(`Unhandled relevant event: ${event.type}`)
      }
    } catch (error) {
      logger.error({ err: error }, "Webhook handler failed")
      return createErrorResponse("Webhook handler failed", 400)
    }
  } else {
    logger.debug("Ignoring irrelevant event", { type: event.type })
  }

  logger.info("Successfully processed webhook", { type: event.type })
  return NextResponse.json({ received: true })
}
