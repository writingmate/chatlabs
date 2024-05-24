import { createClient } from "@/lib/supabase/middleware"
import { i18nRouter } from "next-i18n-router"
import { NextResponse, type NextRequest } from "next/server"
import i18nConfig from "./i18nConfig"
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { SupabaseClient } from "@supabase/supabase-js";

const ratelimit = new Ratelimit({
  redis: kv,
  // 5 requests from the same IP in 10 seconds
  limiter: Ratelimit.slidingWindow(5, '10 s'),
})

async function rateLimitMiddleware(supabase: SupabaseClient, session: any, request: NextRequest) {
  if (session && request.nextUrl.pathname.startsWith('/api/chat')) {
    const userId = session.data.session?.user.id
    if (userId) {
      const { success, pending, limit, reset, remaining } = await ratelimit.limit(
        userId
      )

      if (!success) {
        return NextResponse.json({
          message: "Rate limit exceeded",
        }, {
          status: 429,
        })
      }
    }
  }
}

async function redirectToChatMiddleware(supabase: SupabaseClient, session: any, request: NextRequest) {
  const redirectToChat = session && request.nextUrl.pathname === "/"

  if (redirectToChat) {
    const { data: homeWorkspace, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", session.data.session?.user.id)
      .eq("is_home", true)
      .single()

    if (!homeWorkspace) {
      throw new Error(error?.message)
    }

    return NextResponse.redirect(
      new URL(`/${homeWorkspace.id}/chat`, request.url)
    )
  }
}

const middlewares = [
  rateLimitMiddleware,
  redirectToChatMiddleware
]

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    const session = await supabase.auth.getSession()

    for (const middleware of middlewares) {
      const result = await middleware(supabase, session, request)
      if (result) {
        return result
      }
    }

    return response
  } catch
    (e) {
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    })
  }
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next|auth).*)"
}
