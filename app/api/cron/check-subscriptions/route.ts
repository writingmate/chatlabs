import { NextResponse } from "next/server"
import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import axios from "axios"
import Stripe from "stripe"

import { logger } from "@/lib/logger"

const stripeApiKey = process.env.STRIPE_API_KEY!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN!
const telegramChatId = process.env.TELEGRAM_CHAT_ID!
const ignoredEmails = process.env.IGNORED_EMAILS?.split(",") || []
const cronSecret = process.env.CRON_SECRET!

const stripe = new Stripe(stripeApiKey, {
  apiVersion: "2023-10-16"
})

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

interface StripeSubscription {
  id: string
  customer: any
  items: {
    data: Array<{
      price: {
        lookup_key: string
      }
    }>
  }
}

interface SupabaseUser {
  id: string
  email: string
}

interface ProfileData {
  user_id: string
  plan: string
  stripe_customer_id: string
}

// Add this function to validate the CRON_SECRET
function validateRequest(req: Request): boolean {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }
  const token = authHeader.split(" ")[1]
  return token === cronSecret
}

// Add this function to check if the request is from localhost
function isLocalhost(req: Request): boolean {
  const host = req.headers.get("host")
  return host?.includes("localhost") || host?.includes("127.0.0.1") || false
}

async function getAllStripeSubscriptions(): Promise<StripeSubscription[]> {
  logger.info("Fetching all Stripe subscriptions")
  let allSubscriptions: StripeSubscription[] = []
  let hasMore = true
  let startingAfter: string | undefined = undefined

  while (hasMore) {
    const subscriptions: any = await stripe.subscriptions.list({
      limit: 100,
      status: "active",
      expand: ["data.customer"],
      starting_after: startingAfter
    })

    allSubscriptions = allSubscriptions.concat(
      subscriptions.data as StripeSubscription[]
    )
    hasMore = subscriptions.has_more

    if (hasMore && subscriptions.data.length > 0) {
      startingAfter = subscriptions.data[subscriptions.data.length - 1].id
    }
  }

  logger.info(`Fetched ${allSubscriptions.length} Stripe subscriptions`)
  return allSubscriptions
}

async function getAllSupabaseUsers(): Promise<SupabaseUser[]> {
  logger.info("Fetching all Supabase users")
  let allUsers: SupabaseUser[] = []
  let page = 1
  const perPage = 1000

  while (true) {
    const {
      data: { users },
      error
    } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: perPage
    })

    if (error) {
      logger.error(
        { err: error },
        `Error fetching Supabase users: ${error.message}`
      )
      throw new Error(`Error fetching Supabase users: ${error.message}`)
    }

    allUsers = allUsers.concat(users as SupabaseUser[])

    if (users.length < perPage) {
      break
    }

    page++
  }

  logger.info(`Fetched ${allUsers.length} Supabase users`)
  return allUsers
}

async function getAllProfiles(): Promise<ProfileData[]> {
  logger.info("Fetching all non-free profiles")
  let allProfiles: ProfileData[] = []
  let page = 0
  const perPage = 1000

  while (true) {
    const { data, error, count } = await supabase
      .from("profiles")
      .select("user_id, plan, stripe_customer_id")
      .neq("plan", "free")
      .range(page * perPage, (page + 1) * perPage - 1)

    if (error) {
      logger.error({ err: error }, "Error fetching profiles")
      throw new Error(`Error fetching profiles: ${error.message}`)
    }

    allProfiles = allProfiles.concat(data as ProfileData[])

    if (!count || data.length < perPage) {
      break
    }

    page++
  }

  logger.info(`Fetched ${allProfiles.length} non-free profiles`)
  return allProfiles
}

async function sendTelegramMessage(message: string) {
  logger.info(
    {
      telegramChatId,
      telegramBotToken: telegramBotToken.substring(0, 10) + "..." // Log only part of the token for security
    },
    "Sending Telegram message"
  )
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`

  try {
    logger.info(
      {
        messageLength: message.length
      },
      "Sending Telegram message"
    )

    const response = await axios.post(url, {
      chat_id: telegramChatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true
    })

    logger.info(
      {
        status: response.status,
        statusText: response.statusText
      },
      "Telegram API response"
    )
  } catch (error) {
    logger.error(
      {
        err: error instanceof Error ? error.message : String(error)
      },
      "Error sending Telegram message"
    )

    if (axios.isAxiosError(error) && error.response) {
      logger.error(
        {
          response: error.response.data,
          status: error.response.status,
          statusText: error.response.statusText
        },
        "Telegram API error response"
      )
    }
    throw error // Re-throw the error to be handled by the caller
  }
}

function formatAsciTable(headers: string[], rows: string[][]): string {
  // Calculate column widths
  const columnWidths = headers.map((header, index) => {
    const maxWidth = Math.max(
      header.length,
      ...rows.map(row => (row[index] ? row[index].length : 0))
    )
    return Math.min(maxWidth, 30) // Cap column width at 30 characters
  })

  // Format header
  const headerRow = headers
    .map((header, index) => header.padEnd(columnWidths[index]))
    .join(" | ")

  // Format separator
  const separator = columnWidths.map(width => "-".repeat(width)).join("-+-")

  // Format rows
  const formattedRows = rows.map(row =>
    row
      .map((cell, index) => (cell || "").padEnd(columnWidths[index]))
      .join(" | ")
  )

  // Combine all parts
  return [headerRow, separator, ...formattedRows].join("\n")
}

export async function GET(req: Request) {
  // Add this check at the beginning of the GET function
  if (!isLocalhost(req) && !validateRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      logger.info("Starting subscription check")
      controller.enqueue("Starting subscription check\n")
      try {
        const stripeSubscriptions = await getAllStripeSubscriptions()
        const supabaseUsers = await getAllSupabaseUsers()
        const profiles = await getAllProfiles()

        const stripeSubscriptionMap = new Map(
          stripeSubscriptions.map(sub => [sub.customer.id, sub])
        )
        const supabaseUserMap = new Map(
          supabaseUsers.map(user => [user.email, user])
        )

        let mismatchedUsers: string[][] = []

        logger.info(
          "Checking for free plans in Supabase with active Stripe subscriptions"
        )
        controller.enqueue(
          "Checking for free plans in Supabase with active Stripe subscriptions\n"
        )
        for (const subscription of stripeSubscriptions) {
          const customer = subscription.customer
          const email = customer.email
          const stripePlan = subscription.items.data[0].price.lookup_key
          const stripeCustomerId = customer.id

          if (!email || !stripePlan || ignoredEmails.includes(email)) {
            continue
          }

          const supabaseUser = supabaseUserMap.get(email)
          if (!supabaseUser) {
            logger.warn(`User ${email} not found in Supabase`)
            mismatchedUsers.push([
              email,
              "Not found",
              "-",
              stripePlan,
              stripeCustomerId
            ])
            controller.enqueue(`${email}: Not found\n`)
            continue
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id, plan, stripe_customer_id")
            .eq("user_id", supabaseUser.id)
            .single()

          if (!profile) {
            logger.warn(`Profile for user ${email} not found in Supabase`)
            mismatchedUsers.push([
              email,
              "N/A in Supabase",
              "-",
              stripePlan,
              stripeCustomerId
            ])
            controller.enqueue(`${email}: Profile not found in Supabase\n`)
            continue
          }

          if (profile.plan === "free" && stripePlan !== "free") {
            logger.warn(
              `Mismatch found for user ${email}: Supabase plan (free) != Stripe plan (${stripePlan})`
            )
            mismatchedUsers.push([
              email,
              "Plan mismatch",
              "free",
              stripePlan,
              stripeCustomerId
            ])
            controller.enqueue(
              `${email}: Supabase plan (free) != Stripe plan (${stripePlan})\n`
            )
          }

          if (profile.stripe_customer_id !== stripeCustomerId) {
            logger.warn(`Stripe customer ID mismatch for user ${email}`)
            mismatchedUsers.push([
              email,
              "Stripe ID mismatch",
              profile.plan,
              stripePlan,
              stripeCustomerId
            ])
            controller.enqueue(`${email}: Stripe customer ID mismatch\n`)
          }
        }

        logger.info(
          "Checking for non-free plans in Supabase without active Stripe subscriptions"
        )
        controller.enqueue(
          "Checking for non-free plans in Supabase without active Stripe subscriptions\n"
        )
        for (const profile of profiles) {
          if (profile.plan !== "free" && profile.stripe_customer_id) {
            const stripeSubscription = stripeSubscriptionMap.get(
              profile.stripe_customer_id
            )
            if (!stripeSubscription) {
              const supabaseUser = supabaseUsers.find(
                u => u.id === profile.user_id
              )
              const email = supabaseUser ? supabaseUser.email : "Unknown"

              if (!ignoredEmails.includes(email)) {
                logger.warn(
                  `No active Stripe subscription found for non-free plan user ${email}`
                )
                mismatchedUsers.push([
                  email,
                  "No Stripe sub",
                  profile.plan,
                  "-",
                  profile.stripe_customer_id
                ])
                controller.enqueue(
                  `${email}: No active Stripe subscription found for non-free plan\n`
                )
              }
            }
          }
        }

        if (mismatchedUsers.length > 0) {
          logger.info(`Found ${mismatchedUsers.length} mismatched users`)
          controller.enqueue(
            `Found ${mismatchedUsers.length} mismatched users\n`
          )

          const headers = [
            "Email",
            "Issue",
            "Supabase Plan",
            "Stripe Plan",
            "Stripe Customer"
          ]

          // Send rows in batches
          const batchSize = 20 // Adjust this number based on your needs
          for (let i = 0; i < mismatchedUsers.length; i += batchSize) {
            const batch = mismatchedUsers.slice(i, i + batchSize)
            const formattedRows = batch.map(
              ([email, issue, supabasePlan, stripePlan, stripeCustomerId]) => [
                email,
                issue,
                supabasePlan || "-",
                stripePlan || "-",
                stripeCustomerId
              ]
            )

            const tableContent = formatAsciTable(headers, formattedRows)

            const message = `<pre>${tableContent}</pre>`
            try {
              await sendTelegramMessage(message)
              controller.enqueue(
                `Telegram message batch ${Math.floor(i / batchSize) + 1} sent\n`
              )
            } catch (error) {
              logger.error(
                {
                  err: error
                },
                `Failed to send Telegram message batch ${Math.floor(i / batchSize) + 1}`
              )
              controller.enqueue(
                `Failed to send Telegram message batch ${Math.floor(i / batchSize) + 1}\n`
              )
            }

            // Add a small delay between batches to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        } else {
          logger.info("No mismatched users found")
          controller.enqueue("No mismatched users found\n")
          try {
            await sendTelegramMessage("No mismatched users found")
            controller.enqueue("Telegram message sent\n")
          } catch (error) {
            logger.error({ err: error }, "Failed to send Telegram message")
            controller.enqueue("Failed to send Telegram message\n")
          }
        }

        logger.info("Subscription check completed successfully")
        controller.enqueue("Subscription check completed successfully\n")
      } catch (error: any) {
        const errorMessage =
          error.response?.data || error.message || String(error)
        logger.error({ err: error }, "Error checking subscriptions")
        controller.enqueue(`Error checking subscriptions: ${errorMessage}\n`)
        controller.error(error)
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  })
}
