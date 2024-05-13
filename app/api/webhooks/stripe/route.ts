import type { Stripe } from "stripe"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { Database } from "@/supabase/types"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { ACTIVE_PLAN_STATUSES, PLAN_FREE, PLANS } from "@/lib/stripe/config"
import { kv } from "@vercel/kv"
import { buffer } from "node:stream/consumers"
import {
  getProfileByStripeCustomerId,
  getProfileByUserId,
  updateProfileByUserId
} from "@/db/profile"

// try 10 times before giving up retrieving profile
const MAX_RETRIES = 10
const RETRY_DELAY_MS = 2000

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

type Logger = {
  log: (...args: any[]) => void
  error: (...args: any[]) => void
}

async function waitGetProfileByStripeCustomerId(
  supabaseAdmin: SupabaseClient,
  stripeCustomerId: string,
  logger: Logger
) {
  let retries = 0
  while (retries < MAX_RETRIES) {
    logger.log(`Retrieving profile for customer ${stripeCustomerId}`)
    const { data: profile } = await getProfileByStripeCustomerId(
      supabaseAdmin,
      stripeCustomerId
    )
    if (profile) {
      logger.log(`Profile found for customer ${stripeCustomerId}`)
      return profile
    }
    logger.log(`Profile not found for customer ${stripeCustomerId}`)
    retries++
    logger.log(`Retrying in ${RETRY_DELAY_MS}ms`)
    await sleep(RETRY_DELAY_MS)
  }
  return null
}

const waitForProfileByUserId = async (
  supabaseAdmin: SupabaseClient,
  userId: string,
  logger: Logger
) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      const profile = await getProfileByUserId(userId, supabaseAdmin)
      if (profile) {
        return profile
      }
    } catch (error) {
      logger.error(`Error retrieving profile for user ${userId}:`, error)
    }
    retries++
    await sleep(RETRY_DELAY_MS)
  }
  return null
}

async function registerUser(
  supabaseAdmin: SupabaseClient,
  customer: Stripe.Customer,
  stripeCustomerId: string,
  logger: Logger
) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: customer.email!,
    email_confirm: true
  })

  if (error) {
    throw error
  }

  const userId = data.user!.id

  await stripe.customers.update(stripeCustomerId, {
    metadata: {
      supabaseUUID: userId
    }
  })

  const profile = await waitForProfileByUserId(supabaseAdmin, userId, logger)

  if (!profile) {
    throw new Error("Profile not found after user registration")
  }

  return userId
}

function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status })
}

// redis based lock
class Lock {
  constructor(
    private kvv: typeof kv,
    private key: string
  ) {
    this.kvv = kvv
    this.key = key
  }

  // only acquire the lock if it's not already taken
  // wait MAX_RETRIES for the lock to be released
  async acquire() {
    let retries = 0
    while (retries < MAX_RETRIES) {
      const value = await this.kvv.get(this.key)
      if (value === "locked") {
        retries++
        await sleep(RETRY_DELAY_MS)
      } else {
        await this.kvv.set(this.key, "locked")
        return true
      }
    }
    return false
  }
  async release() {
    await this.kvv.del(this.key)
  }
}

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
    console.log(`❌ Error parsing event message: ${errorMessage}`)
    return createErrorResponse(`Webhook Error: ${errorMessage}`, 400)
  }

  const logger: Logger = {
    log(message: string) {
      console.log(`[${event.id}][${event.type}]: ${message}`)
    },
    error(message: string, error?: any) {
      console.error(`[${event.id}][${event.type}]: ${message}`, error)
    }
  }

  logger.log("Success parsing event")

  const permittedEvents: string[] = [
    "customer.subscription.deleted",
    "customer.subscription.updated",
    "customer.subscription.created"
  ]

  if (permittedEvents.includes(event.type)) {
    subscription = event.data.object as Stripe.Subscription

    const stripeCustomerId = subscription.customer as string

    const customer = (await stripe.customers.retrieve(
      stripeCustomerId
    )) as Stripe.Customer

    let userId = null

    // Scenario 1: User and profile already exist
    const existingProfileByStripeCustomerId =
      await waitGetProfileByStripeCustomerId(
        supabaseAdmin,
        stripeCustomerId,
        logger
      )

    if (existingProfileByStripeCustomerId) {
      userId = existingProfileByStripeCustomerId.user_id
    } else {
      // Scenario 2: User is not registered, so register them first
      try {
        userId = await registerUser(
          supabaseAdmin,
          customer,
          stripeCustomerId,
          logger
        )
      } catch (error) {
        logger.error("Error during user registration", error)
        // console.warn("Error during user registration:", error)
        // User already exists, retrieve the profile

        logger.log(`Retrieving profile for customer ${stripeCustomerId}`)

        const profile = await waitGetProfileByStripeCustomerId(
          supabaseAdmin,
          stripeCustomerId,
          logger
        )

        if (!profile) {
          logger.error("Profile not found after user registration error")
          return createErrorResponse("Webhook handler failed", 500)
        }

        logger.log(`Profile found for customer ${stripeCustomerId}`)

        userId = profile.user_id
      }
    }

    logger.log(`User ID ${userId}, Stripe ID (${stripeCustomerId})`)

    const lock = new Lock(kv, `stripe-webhook-${stripeCustomerId}`)

    // Scenario 3: Update the profile record accordingly
    try {
      logger.log("Acquiring lock")
      if (!(await lock.acquire())) {
        logger.log("Unable to acquire lock")
        return createErrorResponse("Webhook handler failed", 500)
      }

      logger.log("Lock acquired")

      switch (event.type) {
        case "customer.subscription.deleted":
          await updateProfileByUserId(supabaseAdmin, userId, {
            stripe_customer_id: stripeCustomerId,
            plan: PLAN_FREE
          })
          logger.log("Profile updated with free plan")
          break
        case "customer.subscription.created":
        case "customer.subscription.updated":
          const status = subscription.status
          let plan = PLAN_FREE
          const planFromSubscription =
            subscription.items.data[0].price.lookup_key!
          if (
            ACTIVE_PLAN_STATUSES.includes(status) &&
            PLANS.includes(planFromSubscription)
          ) {
            plan = planFromSubscription
          }
          await updateProfileByUserId(supabaseAdmin, userId, {
            stripe_customer_id: stripeCustomerId,
            plan
          })
          logger.log(`Profile updated with plan ${plan}`)
          break
      }
    } catch (error) {
      logger.error("Error updating profile", error)
      return createErrorResponse("Webhook handler failed", 500)
    } finally {
      logger.log("Releasing lock")
      await lock.release()
      logger.log("Lock released")
    }
  }

  logger.log("Success handling event")

  return NextResponse.json({ message: "Received" }, { status: 200 })
}
