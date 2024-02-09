import type { Stripe } from "stripe"

import { NextResponse } from "next/server"

import { stripe } from "@/lib/stripe"
import { updateProfile } from "@/db/profile"

export async function POST(req: Request) {
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    // On error, log and return the error message.
    if (err! instanceof Error) console.log(err)
    console.log(`❌ Error message: ${errorMessage}`)
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    )
  }

  // Successfully constructed event.
  console.log("✅ Success:", event.id)

  const permittedEvents: string[] = [
    "customer.subscription.deleted",
    "customer.subscription.updated",
    "customer.subscription.created"
  ]

  if (permittedEvents.includes(event.type)) {
    let data

    try {
      switch (event.type) {
        case "customer.subscription.deleted":
          subscription = event.data.object as Stripe.Subscription
          await updateProfile()
          break
        case "customer.subscription.created":
        case "customer.subscription.updated":
          subscription = event.data.object as Stripe.Subscription
          status = subscription.status
          plan = getPlanFromPriceId(subscription.items.data?.[0]?.price?.id)
          customer = await ensureCustomerWithEmail(subscription)
          const subscriptionActive = !!plan
          plan = plan || "free"
          if (["active", "trialing"].indexOf(status) > -1) {
            await upsertUserAndPlan(
              customer.email as string,
              customer.id,
              subscriptionActive,
              plan
            )
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
  // Return a response to acknowledge receipt of the event.
  return NextResponse.json({ message: "Received" }, { status: 200 })
}
