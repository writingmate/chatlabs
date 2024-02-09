"use server";

import type { Stripe } from "stripe";

import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getOrCreateCustomer } from "@/lib/stripe/get-or-create-customer";
import { STRIPE_TRIAL_PERIOD_DAYS, PLANS } from "@/lib/stripe/config";

export async function createCheckoutSession(
  data: FormData,
): Promise<{ client_secret: string | null; url: string | null }> {
  const plan = data.get(
    "plan",
  ) as string;

  const userId = data.get('userId') as string;

  const email = data.get("email") as string

  if (!userId) {
    throw new Error("User ID is required");
  }

  const origin: string = headers().get("origin") as string;

  if (!PLANS.includes(plan)) {
    throw new Error("Invalid plan")
  }

  const prices = await stripe.prices.list({
    lookup_keys: [plan],
  })

  if(prices.data.length === 0) {
    throw new Error("Invalid plan")
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
      automatic_tax: {
        enabled: true,
      },
      subscription_data: {
        trial_period_days: STRIPE_TRIAL_PERIOD_DAYS,
      },
      line_items: [
        {
          price: price,
          quantity: 1,
        },
      ],
      success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription/success`,
    });

  return {
    client_secret: checkoutSession.client_secret,
    url: checkoutSession.url,
  };
}
