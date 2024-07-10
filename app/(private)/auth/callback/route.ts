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

  const urlParams = new URLSearchParams()
  if (error_description) {
    urlParams.append("error_description", error_description)
  }
  if (next) {
    urlParams.append("next", next)
  }

  if (error_description) {
    return NextResponse.redirect(
      requestUrl.origin + "/login?" + urlParams.toString()
    )
  }

  return NextResponse.redirect(requestUrl.origin + `/${next || ""}`)
}
