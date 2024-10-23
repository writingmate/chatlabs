import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import { AuthError, SupabaseClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/browser-client"

async function getUserByEmail(client: SupabaseClient, email: string) {
  const params = new URLSearchParams({
    filter: email
  })
  // make a direct http call to supabase admin api with fetch
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  )
  logger.info(
    { result: result.status, resultText: result.statusText },
    `User search result`
  )
  if (result.ok) {
    const data = await result.json()
    logger.info({ data }, `User search data`)
    return data.users.find((user: any) => user.email === email)
  }

  logger.error({ result }, `User search error`)

  return null
}

export async function POST(req: Request) {
  const { workspaceId, email } = await req.json()
  const client = createClient()
  const admin = createServiceRoleClient()

  logger.info(
    `Received invitation request for workspace ${workspaceId} and email ${email}`
  )

  // Check if the user is authenticated
  const {
    data: { user },
    error: authError
  } = await client.auth.getUser()
  if (authError || !user) {
    logger.error({ err: authError }, `Authentication error`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  logger.info(`User ${user.id} authenticated successfully`)

  logger.info({ admin: admin.auth.admin }, `Admin client`)

  let existingUser = await getUserByEmail(admin, email)

  logger.info({ existingUser }, `Existing user`)

  if (!existingUser) {
    // Check if the invited user already exists using Auth Admin API
    // If the user doesn't exist, send an invitation email
    const { data: invitedUser, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(email, {
        data: {
          workspaceId: workspaceId,
          invitedBy: user.id
        }
      })

    if (inviteError instanceof AuthError) {
      logger.error({ err: inviteError }, `Error sending invitation`)
      return NextResponse.json(
        { error: "Error sending invitation" },
        { status: 500 }
      )
    }

    logger.info({ invitedUser }, `Invitation sent successfully to ${email}`)

    existingUser = invitedUser.user
  } else {
    await supabase.auth.resend({
      email: email,
      type: "signup"
    })
    logger.info(`User ${existingUser.id} already exists. Skipping creation.`)
  }

  // Create or update workspace_user entry
  const { error: upsertError } = await client.from("workspace_users").upsert(
    {
      workspace_id: workspaceId,
      user_id: existingUser.id,
      email: email,
      role: "MEMBER",
      status: "PENDING"
    },
    {
      onConflict: "workspace_id,email"
    }
  )

  if (upsertError) {
    logger.error({ err: upsertError }, `Error creating invitation record`)
    return NextResponse.json(
      { error: "Error creating invitation" },
      { status: 500 }
    )
  }

  logger.info(
    `Workspace user record created/updated for ${email} in workspace ${workspaceId}`
  )

  return NextResponse.json({
    message: "Invitation sent successfully"
  })
}
