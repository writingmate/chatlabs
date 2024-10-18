import { createClient } from "@supabase/supabase-js"
import { Database } from "@/supabase/types"
import { stripe } from "@/lib/stripe/stripe"
import { updateProfileByUserId } from "@/db/profile"
import { getWorkspaceById, updateWorkspaceById } from "@/db/workspaces"

export const getOrCreateCustomer = async ({
  email,
  workspaceId
}: {
  email: string
  workspaceId: string
}) => {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const workspace = await getWorkspaceById(workspaceId)
  if (!workspace?.stripe_customer_id) {
    // No customer record found, let's create one.
    const customerData: { metadata: { supabaseUUID: string }; email?: string } =
      {
        metadata: {
          supabaseUUID: workspaceId
        }
      }
    if (email) customerData.email = email
    const customer = await stripe.customers.create(customerData)
    // Now insert the customer ID into our Supabase mapping table.
    const { error: supabaseError } = await updateWorkspaceById(
      supabaseAdmin,
      workspaceId,
      {
        stripe_customer_id: customer.id
      }
    )
    if (supabaseError) throw supabaseError
    console.log(
      `Updated workspace with id ${workspaceId} with customer ID ${customer.id}.`
    )
    return customer.id
  }
  return workspace.stripe_customer_id
}
