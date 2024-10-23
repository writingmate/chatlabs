import { stripe } from "./stripe"
import { logger } from "@/lib/logger"

interface CreateCheckoutSessionParams {
  customerId: string
  priceId: string
  origin: string
  metadata?: Record<string, string>
}

export async function createCheckoutSession({
  customerId,
  priceId,
  origin,
  metadata
}: CreateCheckoutSessionParams): Promise<{
  client_secret: string | null
  url: string | null
}> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: "subscription",
      success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription/cancel`,
      metadata
    })

    return {
      client_secret: session.client_secret,
      url: session.url
    }
  } catch (error) {
    logger.error({ err: error }, "Error creating checkout session")
    throw error
  }
}
