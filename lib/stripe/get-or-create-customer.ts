import { createClient } from "@supabase/supabase-js"
import { Database } from "@/supabase/types"
import { stripe } from "@/lib/stripe/stripe"
import { updateProfileByUserId } from "@/db/profile"

export const getOrCreateCustomer = async ({
  email,
  userId
}: {
  email: string
  userId: string
}) => {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  function getProfileByUserId(userId: string) {
    return supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single()
  }

  const { data, error } = await getProfileByUserId(userId)
  if (error || !data?.stripe_customer_id) {
    // No customer record found, let's create one.
    const customerData: { metadata: { supabaseUUID: string }; email?: string } =
      {
        metadata: {
          supabaseUUID: userId
        }
      }
    if (email) customerData.email = email
    const customer = await stripe.customers.create(customerData)
    // Now insert the customer ID into our Supabase mapping table.
    const { error: supabaseError } = await updateProfileByUserId(
      supabaseAdmin,
      userId,
      {
        stripe_customer_id: customer.id
      }
    )
    if (supabaseError) throw supabaseError
    console.log(
      `Updated profile with user_id ${userId} with customer ID ${customer.id}.`
    )
    return customer.id
  }
  return data.stripe_customer_id
}
