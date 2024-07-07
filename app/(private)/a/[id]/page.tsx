import { ChatUI } from "@/components/chat/chat-ui"
import { getAssistantByHashId } from "@/db/assistants"
import { parseIdFromSlug } from "@/lib/slugify"
import { ChatbotUIChatProvider } from "@/context/chat"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import LoginDialog from "@/components/login/login-dialog"
import { PlanPicker } from "@/components/upgrade/plan-picker"

export default async function AssistantPage({
  params
}: {
  params: { id: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const user = await supabase.auth.getUser()

  const assistant = await getAssistantByHashId(
    parseIdFromSlug(params.id),
    supabase
  )

  return (
    <ChatbotUIChatProvider id={"one"}>
      <ChatUI showModelSelector={false} assistant={assistant} />
      <PlanPicker />
      {!user.data.user && <LoginDialog redirectTo={"/a/" + params.id} />}
    </ChatbotUIChatProvider>
  )
}
