import { ChatUI } from "@/components/chat/chat-ui"
import { getAssistantByHashId } from "@/db/assistants"
import { parseIdFromSlug } from "@/lib/slugify"
import { ChatbotUIChatProvider } from "@/context/chat"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import LoginDialog from "@/components/login/login-dialog"
import { PlanPicker } from "@/components/upgrade/plan-picker"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { notFound } from "next/navigation"
import { Tables } from "@/supabase/types"
import { User } from "@sentry/nextjs"
import { ApiError } from "next/dist/server/api-utils"

export default async function AssistantPage({
  params
}: {
  params: { id: string }
}) {
  let assistant: Tables<"assistants"> | null = null
  let profile: Tables<"profiles"> | null = null
  let user: User | null = null

  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    user = await supabase.auth.getUser()

    assistant = await getAssistantByHashId(parseIdFromSlug(params.id), supabase)

    profile = await getServerProfile()
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("ApiError", error)
    } else {
      return notFound()
    }
  }

  if (!assistant || !user) {
    return notFound()
  }

  return (
    <ChatbotUIChatProvider id={"one"}>
      <div className={"size-full"}>
        <ChatUI
          showModelSelector={false}
          assistant={assistant}
          experimentalCodeEditor={profile?.experimental_code_editor || false}
        />
      </div>
      <PlanPicker />
      {user?.data?.user ? null : <LoginDialog />}
    </ChatbotUIChatProvider>
  )
}
