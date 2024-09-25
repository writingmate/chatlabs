const Stripe = require("stripe").default
const { createClient } = require("@supabase/supabase-js")
const readline = require("readline")

const stripeApiKey = process.env.STRIPE_API_KEY!
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

// Initialize Stripe
const stripe = new Stripe(stripeApiKey, {
  apiVersion: "2023-10-16" // Use the latest API version
})

// Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

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

async function getAllStripeSubscriptions(): Promise<StripeSubscription[]> {
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

  return allSubscriptions
}

async function getAllSupabaseUsers(): Promise<SupabaseUser[]> {
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
      throw new Error(`Error fetching Supabase users: ${error.message}`)
    }

    // @ts-ignore
    allUsers = allUsers.concat(users)

    if (users.length < perPage) {
      break
    }

    page++
  }

  return allUsers
}

async function getAllProfiles(): Promise<ProfileData[]> {
  let allProfiles: ProfileData[] = []
  let page = 0
  const perPage = 1000

  while (true) {
    const { data, error, count } = await supabase
      .from("profiles")
      .select("user_id, plan, stripe_customer_id")
      .neq("plan", "free")

    if (error) {
      throw new Error(`Error fetching profiles: ${error.message}`)
    }

    allProfiles = allProfiles.concat(data as ProfileData[])

    if (!count || data.length < perPage) {
      break
    }

    page++
  }

  return allProfiles
}

function askForPermission(question: string): Promise<boolean> {
  return new Promise(resolve => {
    rl.question(question, (answer: any) => {
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes")
    })
  })
}

async function updateProfile(userId: string, plan: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ plan: plan })
    .eq("user_id", userId)

  if (error) {
    console.error(`Error updating profile for user ${userId}: ${error.message}`)
  } else {
    console.log(`Updated profile for user ${userId} to plan: ${plan}`)
  }
}

async function checkAndUpdateSubscriptions() {
  try {
    const stripeSubscriptions = await getAllStripeSubscriptions()
    const supabaseUsers = await getAllSupabaseUsers()

    const stripeSubscriptionMap = new Map(
      stripeSubscriptions.map(sub => [sub.customer.id, sub])
    )
    const supabaseUserMap = new Map(
      supabaseUsers.map(user => [user.email, user])
    )

    // Check for free plans in Supabase with active Stripe subscriptions and Stripe customer ID mismatches
    for (const subscription of stripeSubscriptions) {
      const customer = subscription.customer
      const email = customer.email
      const stripePlan = subscription.items.data[0].price.lookup_key
      const stripeCustomerId = customer.id

      if (!email || !stripePlan) {
        console.log(
          `Skipping subscription ${subscription.id} due to missing email or plan`
        )
        continue
      }

      const supabaseUser = supabaseUserMap.get(email)
      if (!supabaseUser) {
        console.log(`User with email ${email} not found in Supabase`)
        continue
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, plan, stripe_customer_id")
        .eq("user_id", supabaseUser.id)
        .single()

      if (profileError) {
        console.log(
          `Error fetching profile for user ${email}: ${profileError.message}`
        )
        continue
      }

      if (!profile) {
        console.log(`Profile for user ${email} not found in Supabase`)
        continue
      }

      let shouldUpdatePlan = false
      let shouldUpdateStripeCustomerId = false

      if (profile.plan === "free" && stripePlan !== "free") {
        console.log(`Plan mismatch found for user ${email}:`)
        console.log(`  Stripe plan: ${stripePlan}`)
        console.log(`  Supabase plan: ${profile.plan}`)

        shouldUpdatePlan = await askForPermission(
          `Do you want to update the plan for user ${email} from 'free' to '${stripePlan}'? (y/n): `
        )
      }

      if (profile.stripe_customer_id !== stripeCustomerId) {
        console.log(`Stripe customer ID mismatch found for user ${email}:`)
        console.log(`  Stripe customer ID: ${stripeCustomerId}`)
        console.log(
          `  Supabase stripe_customer_id: ${profile.stripe_customer_id}`
        )

        shouldUpdateStripeCustomerId = await askForPermission(
          `Do you want to update the Stripe customer ID for user ${email}? (y/n): `
        )
      }

      if (shouldUpdatePlan || shouldUpdateStripeCustomerId) {
        const updateData: { plan?: string; stripe_customer_id?: string } = {}
        if (shouldUpdatePlan) updateData.plan = stripePlan
        if (shouldUpdateStripeCustomerId)
          updateData.stripe_customer_id = stripeCustomerId

        const { error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("user_id", supabaseUser.id)

        if (error) {
          console.error(
            `Error updating profile for user ${email}: ${error.message}`
          )
        } else {
          console.log(`Updated profile for user ${email}:`, updateData)
        }
      } else {
        console.log(`Skipped updating user ${email}`)
      }
    }

    // Check for non-free plans in Supabase without active Stripe subscriptions
    const profiles = await getAllProfiles()

    for (const profile of profiles) {
      if (profile.plan !== "free" && profile.stripe_customer_id) {
        const stripeSubscription = stripeSubscriptionMap.get(
          profile.stripe_customer_id
        )
        if (!stripeSubscription) {
          const supabaseUser = supabaseUsers.find(u => u.id === profile.user_id)
          const email = supabaseUser ? supabaseUser.email : "Unknown"

          console.log(`Mismatch found for user ${email}:`)
          console.log(`  Supabase plan: ${profile.plan}`)
          console.log(`  No active Stripe subscription found`)

          const shouldUpdate = await askForPermission(
            `Do you want to update the plan for user ${email} from '${profile.plan}' to 'free'? (y/n): `
          )

          if (shouldUpdate) {
            await updateProfile(profile.user_id, "free")
          } else {
            console.log(`Skipped updating user ${email}`)
          }
        }
      }
    }

    console.log("Subscription check and update completed")
  } catch (error) {
    console.error("Error checking and updating subscriptions:", error)
  } finally {
    rl.close()
  }
}

checkAndUpdateSubscriptions()
