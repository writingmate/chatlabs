import { createClient } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { Session, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from 'next/headers'

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '3600 s'),
})

async function rateLimitMiddleware(supabase: SupabaseClient, request: NextRequest) {
  const session = await supabase.auth.getSession()
  if (session && request.nextUrl.pathname.startsWith('/api/chat') && request.method === "POST") {
    const userId = session.data.session?.user.id
    if (userId) {
      const { success, pending, limit, reset, remaining } = await ratelimit.limit(
        [userId, request.nextUrl.pathname].join("-"),
      )

      if (!success) {
        return NextResponse.json({
          message: "You are sending too many messages. Please try again in a few minutes.",
        }, {
          status: 429,
        })
      }
    }
  }
}

async function redirectToSetupMiddleware(supabase: SupabaseClient, request: NextRequest) {
  const session = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.redirect("/")
  }

  const redirectToChat = request.nextUrl.pathname === "/"

  if (!redirectToChat) {
    return
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session.data.session?.user.id)
    .single()

  if (!profile) {
    throw new Error(error?.message)
  }

  if (!profile.has_onboarded) {
    return NextResponse.redirect("/setup")
  }
}

async function redirectToChat(supabase: SupabaseClient, request: NextRequest) {
  const session = await supabase.auth.getSession()
  if (!session) {
    return
  }

  if (request.nextUrl.pathname === "/") {

    const currentUrl = new URL(request.url)

    return NextResponse.redirect(
      new URL(`/chat?${currentUrl.searchParams.toString()}`, request.url)
    )
  }
}

type Middleware = (supabase: SupabaseClient, request: NextRequest) => Promise<NextResponse | void>

const middlewares: Middleware[] = [
  rateLimitMiddleware,
  redirectToSetupMiddleware,
  redirectToChat
]

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    for (const middleware of middlewares) {
      const result = await middleware(supabase, request)
      if (result) {
        return result
      }
    }

    return response
  } catch (e) {
    console.error(e)
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    })
  }
}

export const config = {
  matcher: "/(chat)?",
}
