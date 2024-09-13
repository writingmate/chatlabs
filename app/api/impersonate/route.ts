import { createSigner } from "fast-jwt"
import crypto from "crypto"
import { createClient as baseCreateClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

const IMPERSONATION_JWT_KEY = crypto.randomBytes(32)
const impersonationJwtSigner = createSigner({ key: IMPERSONATION_JWT_KEY })

export async function GET(req: Request) {
  const supabaseAdmin = baseCreateClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const requestUrl = new URL(req.url)

  const supabase = createClient(cookies())

  const { data: userData } = await supabase.auth.getUser()
  const adminEmail = userData?.user?.email

  const allowedDomain =
    process.env.ALLOWED_IMPERSONATION_DOMAIN || "writingmate.ai"

  if (!adminEmail?.endsWith(`@${allowedDomain}`)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
  }

  try {
    const email = requestUrl.searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      )
    }

    const impersonationLoginGeneration =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email
      })

    const tokenHash =
      impersonationLoginGeneration?.data.properties?.hashed_token

    if (!tokenHash) {
      return NextResponse.json(
        { message: "Failed to start impersonation" },
        { status: 500 }
      )
    }

    const searchParams = new URLSearchParams({
      token_hash: tokenHash,
      next: "/",
      type: "magiclink"
    })

    const impersonationLoginLink = `/auth/confirm?${searchParams}`

    const jwt = impersonationJwtSigner({
      admin_email: adminEmail
    })

    const response = NextResponse.redirect(
      requestUrl.origin + impersonationLoginLink
    )
    response.cookies.set("admin-impersonation", jwt, {
      path: "/",
      httpOnly: true
    })

    return response
  } catch (error) {
    console.error("Error starting impersonation:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
