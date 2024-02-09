"use server";

import type { Stripe } from "stripe";

import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(
  data: FormData,
): Promise<{ client_secret: string | null; url: string | null }> {
  const plan = data.get(
    "plan",
  ) as Stripe.Checkout.SessionCreateParams.UiMode;

  const email = data.get("email") as string

  const origin: string = headers().get("origin") as string;

  const prices: string = await stripe.prices.list({
    lookup_keys: [plan],
  })

  if(prices.data.length === 0) {
    throw new Error("Invalid plan")
  }

  const price = prices.data[0].id

  const checkoutSession: Stripe.Checkout.Session =
    await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      subscription_data: {
        trial_period_days: 3,
      },
      line_items: [
        {
          price: price,
          quantity: 1,
        },
      ],
      success_url: `${origin}/upgrade/result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade/cancel`,
      ui_mode: "hosted"
    });

  return {
    client_secret: checkoutSession.client_secret,
    url: checkoutSession.url,
  };
}
