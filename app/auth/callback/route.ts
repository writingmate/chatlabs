import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")
  const error_description = requestUrl.searchParams.get("error_description")

  let baseHost = request.headers.get("host")

  if (baseHost === null) {
    baseHost = requestUrl.origin
  } else {
    baseHost = "https://" + baseHost
  }

  console.log("baseHost", baseHost)

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createClient(cookieStore)
      const { error } = await supabase.auth.exchangeCodeForSession(code)


      if (!error) {
        return NextResponse.redirect(baseHost)
      } else {
        return NextResponse.redirect(
          baseHost + "/login?error_description=" + error.message
        )
      }
    } catch (error) {
      return NextResponse.redirect(
        baseHost + "/login?error_description=" + error
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
