import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

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

export async function GET(request: Request) {
  logger.info(
    { timestamp: new Date().toISOString() },
    "Auth callback initiated"
  )

  const requestUrl = new URL(request.url)
  logger.debug({ url: request.url }, "Full callback URL")

  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")
  const error_description = requestUrl.searchParams.get("error_description")
  const isPopup = requestUrl.searchParams.get("popup") === "true"

  logger.debug(
    { hasCode: !!code, next, error_description, isPopup },
    "Auth parameters"
  )

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createClient(cookieStore)
      logger.info("Exchanging code for session...")
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        logger.error({ err: error }, "Session exchange error")
      } else {
        logger.info(
          { userId: data?.user?.id, sessionExpiry: data?.session?.expires_at },
          "Session exchange successful"
        )
      }
    } catch (error) {
      logger.error({ err: error }, "Failed to exchange code for session")
    }
  }

  const urlParams = new URLSearchParams()
  if (error_description) {
    urlParams.append("error_description", error_description)
  }
  if (next) {
    urlParams.append("next", next)
  }

  if (isPopup) {
    logger.info("Handling popup response")
    return new NextResponse(
      POPUP_HTML.replace("%error%", String(!!error_description)),
      {
        headers: { "Content-Type": "text/html" }
      }
    )
  } else {
    logger.info(
      {
        hasError: !!error_description,
        redirectTo: error_description
          ? requestUrl.origin + "/login?" + urlParams.toString()
          : requestUrl.origin + `/${next || ""}`
      },
      "Handling redirect response"
    )

    if (error_description) {
      return NextResponse.redirect(
        requestUrl.origin + "/login?" + urlParams.toString()
      )
    }
    return NextResponse.redirect(requestUrl.origin + `/${next || ""}`)
  }
}
