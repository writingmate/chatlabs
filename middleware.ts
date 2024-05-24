import { createClient } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { SupabaseClient } from "@supabase/supabase-js";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '3600 s'),
})

async function rateLimitMiddleware(supabase: SupabaseClient, session: any, request: NextRequest) {
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
  matcher: "/((?!static|.*\\..*|_next|auth).*)"
}
