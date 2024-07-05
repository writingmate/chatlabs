import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")
  const error_description = requestUrl.searchParams.get("error_description")

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    await supabase.auth.exchangeCodeForSession(code)
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
