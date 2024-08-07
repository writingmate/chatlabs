import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const POPUP_HTML = `
<html>
  <head>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'AUTH_COMPLETE', error: %error% }, '*');
      }
      window.close();
    </script>
  </head>
  <body>
    Authentication complete. This window should close automatically.
  </body>
</html>`

export const runtime = "edge"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")
  const error_description = requestUrl.searchParams.get("error_description")
  const isPopup = requestUrl.searchParams.get("popup") === "true"

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

  if (isPopup) {
    // If it's a popup, we'll return a page that closes itself and communicates with the opener
    return new NextResponse(
      POPUP_HTML.replace("%error%", String(!!error_description)),
      {
        headers: { "Content-Type": "text/html" }
      }
    )
  } else {
    // For non-popup scenarios, redirect as before
    if (error_description) {
      return NextResponse.redirect(
        requestUrl.origin + "/login?" + urlParams.toString()
      )
    }
    return NextResponse.redirect(requestUrl.origin + `/${next || ""}`)
  }
}
