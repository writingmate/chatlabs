// endpoint returns the list of assistants for the given user

import {
  getAssistantWorkspacesOrderedByMessageCountDesc,
  getPublicAssistantsOrderedByMessageCountDesc
} from "@/db/assistants"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// first the assistants that user chatted with, then the most popular ones that user didn't chat with
export async function GET(req: Request) {
  try {
    const profile = await getServerProfile()

    const supabase = createClient(cookies())
    const response = await Promise.all([
      getAssistantWorkspacesOrderedByMessageCountDesc(
        profile.user_id,
        supabase
      ),
      getPublicAssistantsOrderedByMessageCountDesc(supabase)
    ])

    const assistants = [
      ...response[0],
      ...response[1].filter(
        assistant => !response[0].some(a => a.id === assistant.id)
      )
    ]

    return NextResponse.json({
      assistants
    })
  } catch (error) {
    console.error(error)
    return NextResponse.error()
  }
}
