import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")
  const error_description = requestUrl.searchParams.get("error_description")

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createClient(cookieStore)
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      console.log("Debug error:", error)
      console.log("Redirecting to:", requestUrl.origin + next)

      if (!error) {
        return NextResponse.redirect(`${requestUrl.origin}${next}`)
      } else {
        return NextResponse.redirect(
          requestUrl.origin + "/login?error_description=" + error.message
        )
      }
    } catch (error) {
        return NextResponse.redirect(
          requestUrl.origin + "/login?error_description=" + error
        )
    }
  }

  if (next) {
    return NextResponse.redirect(
      requestUrl.origin + next + "?error_description=" + error_description
    )
  } else {
    if (error_description) {
      return NextResponse.redirect(
        requestUrl.origin + "/login?error_description=" + error_description
      )
    }
    return NextResponse.redirect(requestUrl.origin)
  }
}
