import type { Stripe } from "stripe"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { Database } from "@/supabase/types"
import {
  AuthApiError,
  createClient,
  SupabaseClient
} from "@supabase/supabase-js"
import { ACTIVE_PLAN_STATUSES, PLAN_FREE, PLANS } from "@/lib/stripe/config"
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

async function waitGetProfileByStripeCustomerId(
  supabaseAdmin: SupabaseClient,
  stripeCustomerId: string
) {
  let retries = 0
  while (retries < MAX_RETRIES) {
    console.log(`Retrieving profile for customer ${stripeCustomerId}`)
    const { data: profile } = await getProfileByStripeCustomerId(
      supabaseAdmin,
      stripeCustomerId
    )
    if (profile) {
      console.log(`Profile found for customer ${stripeCustomerId}`)
      return profile
    }
    console.log(`Profile not found for customer ${stripeCustomerId}`)
    retries++
    console.log(`Retrying in ${RETRY_DELAY_MS}ms`)
    await sleep(RETRY_DELAY_MS)
  }
  return null
}

const waitForProfileByUserId = async (
  supabaseAdmin: SupabaseClient,
  userId: string
) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      const profile = await getProfileByUserId(userId, supabaseAdmin)
      if (profile) {
        return profile
      }
    } catch (error) {
      console.error(`Error retrieving profile for user ${userId}:`, error)
    }
    retries++
    await sleep(RETRY_DELAY_MS)
  }
  return null
}

async function registerUser(
  supabaseAdmin: SupabaseClient,
  customer: Stripe.Customer,
  stripeCustomerId: string
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

  const profile = await waitForProfileByUserId(supabaseAdmin, userId)

  if (!profile) {
    throw new Error("Profile not found after user registration")
  }

  return userId
}

function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status })
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
    console.log(`❌ Error message: ${errorMessage}`)
    return createErrorResponse(`Webhook Error: ${errorMessage}`, 400)
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

    const customer = (await stripe.customers.retrieve(
      stripeCustomerId
    )) as Stripe.Customer

    let userId = null

    // Scenario 1: User and profile already exist
    const existingProfileByStripeCustomerId =
      await waitGetProfileByStripeCustomerId(supabaseAdmin, stripeCustomerId)

    if (existingProfileByStripeCustomerId) {
      userId = existingProfileByStripeCustomerId.user_id
    } else {
      // Scenario 2: User is not registered, so register them first
      try {
        userId = await registerUser(supabaseAdmin, customer, stripeCustomerId)
      } catch (error) {
        console.warn("Error during user registration:", error)
        // User already exists, retrieve the profile
        const profile = await waitGetProfileByStripeCustomerId(
          supabaseAdmin,
          stripeCustomerId
        )

        if (!profile) {
          console.error("Profile not found after user registration error")
          return createErrorResponse("Webhook handler failed", 500)
        }

        userId = profile.user_id
      }
    }

    // Scenario 3: Update the profile record accordingly
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
          break
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      return createErrorResponse("Webhook handler failed", 500)
    }
  }

  return NextResponse.json({ message: "Received" }, { status: 200 })
}
