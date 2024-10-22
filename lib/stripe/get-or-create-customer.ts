import { createClient } from "@supabase/supabase-js"
import { Database } from "@/supabase/types"
import { stripe } from "@/lib/stripe/stripe"
import { updateWorkspace } from "@/db/workspaces"

export const getOrCreateCustomer = async ({
  email,
  userId,
  workspaceId
}: {
  email: string
  userId: string
  workspaceId: string
}) => {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  function getWorkspaceById(workspaceId: string) {
    return supabaseAdmin
      .from("workspaces")
      .select("stripe_customer_id")
      .eq("id", workspaceId)
      .single()
  }

  const { data, error } = await getWorkspaceById(workspaceId)
  if (error || !data?.stripe_customer_id) {
    // No customer record found, let's create one.
    const customerData: {
      metadata: { supabaseUUID: string; workspaceId: string }
      email?: string
    } = {
      metadata: {
        supabaseUUID: userId,
        workspaceId: workspaceId
      }
    }
    if (email) customerData.email = email

    const customer = await stripe.customers.create(customerData)

    // Now insert the customer ID into our Supabase workspace table.
    const { error: supabaseError } = await supabaseAdmin
      .from("workspaces")
      .update({ stripe_customer_id: customer.id })
      .eq("id", workspaceId)

    if (supabaseError) throw supabaseError

    console.log(
      `Updated workspace ${workspaceId} with customer ID ${customer.id}.`
    )
    return customer.id
  }
  return data.stripe_customer_id
}
