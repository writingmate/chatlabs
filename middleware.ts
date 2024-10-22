import { createClient } from "@/lib/supabase/middleware"
import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { kv } from "@vercel/kv"
import { SupabaseClient } from "@supabase/supabase-js"
import { logger as log } from "@/lib/logger"

const ratelimit = new Ratelimit({
  // @ts-ignore
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, "3600 s")
})

async function rateLimitMiddleware(
  supabase: SupabaseClient,
  request: NextRequest
) {
  const session = (await supabase.auth.getSession()).data?.session

  if (
    session &&
    request.nextUrl.pathname.startsWith("/api/chat") &&
    request.method === "POST"
  ) {
    const userId = session?.user.id
    if (userId) {
      log.debug({ userId, path: request.nextUrl.pathname }, "Checking rate limit")

      const { success, pending, limit, reset, remaining } =
        await ratelimit.limit([userId, request.nextUrl.pathname].join("-"))

      log.debug({ success, remaining, reset }, "Rate limit check result")

      if (!success) {
        log.warn({ userId }, "Rate limit exceeded")
        return NextResponse.json(
          {
            message:
              "You are sending too many messages. Please try again in a few minutes."
          },
          {
            status: 429
          }
        )
      }
    }
  }
}

async function redirectToSetupMiddleware(
  supabase: SupabaseClient,
  request: NextRequest
) {
  const session = (await supabase.auth.getSession()).data?.session
  const path = request.nextUrl.pathname

  log.debug({ path, hasSession: !!session }, "Checking setup redirect")

  if (!session && path === "/") {
    return
  }

  if (!session && path !== "/") {
    log.info({ from: path }, "Redirecting unauthenticated user to homepage")
    return NextResponse.redirect(new URL("/", request.url))
  }

  const redirectToChat = request.nextUrl.pathname === "/"

  if (!redirectToChat) {
    return
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session?.user.id)
    .single()

  if (!profile) {
    log.info({ userId: session?.user.id }, "Profile not found, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (!profile.has_onboarded) {
    log.info({ userId: session?.user.id }, "User not onboarded, redirecting to setup")
    return NextResponse.redirect(new URL("/setup", request.url))
  }
}

async function redirectToChat(supabase: SupabaseClient, request: NextRequest) {
  const session = (await supabase.auth.getSession()).data?.session
  if (!session) {
    return
  }

  if (request.nextUrl.pathname === "/") {
    const currentUrl = new URL(request.url)
    log.debug({ userId: session.user.id }, "Redirecting authenticated user to chat")
    return NextResponse.redirect(
      new URL(`/chat?${currentUrl.searchParams.toString()}`, request.url)
    )
  }
}

async function routeSubdomainMiddleware(
  supabase: SupabaseClient,
  request: NextRequest
) {
  const host = request.headers.get('host')
  const subdomain = host?.split('.')[0]

  log.debug({ host, subdomain }, "Checking subdomain routing")

  if (host && host.includes('toolzflow.app') && subdomain !== 'www' && subdomain !== 'toolzflow') {
    log.info({ subdomain }, "Rewriting URL for subdomain")
    const newUrl = new URL(`/share/${subdomain}`, request.url)
    return NextResponse.rewrite(newUrl)
  }
}

type Middleware = (
  supabase: SupabaseClient,
  request: NextRequest
) => Promise<NextResponse | void>

const middlewares: Middleware[] = [
  routeSubdomainMiddleware,
  rateLimitMiddleware,
  redirectToSetupMiddleware,
  redirectToChat
]

export async function middleware(request: NextRequest) {
  log.debug(
    {
      path: request.nextUrl.pathname,
      method: request.method,
      host: request.headers.get('host')
    },
    "Middleware processing started"
  )

  const { supabase, response } = createClient(request)

  for (const middleware of middlewares) {
    const result = await middleware(supabase, request)
    if (result) {
      log.info(
        {
          middleware: middleware.name,
          path: request.nextUrl.pathname,
          status: result instanceof NextResponse ? result.status : 'unknown'
        },
        "Middleware intercepted request"
      )
      return result
    }
  }

  log.debug("Middleware processing completed")
  return response
}

export const config = {
  matcher: [
    '/(chat|/api/chat)?'
  ]
}
