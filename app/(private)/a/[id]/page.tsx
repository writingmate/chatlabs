import { ChatUI } from "@/components/chat/chat-ui"
import { Dashboard } from "@/components/ui/dashboard"
import { getAssistantByHashId, getAssistantById } from "@/db/assistants"
import { parseIdFromSlug } from "@/lib/slugify"
import { ChatbotUIChatProvider } from "@/context/chat"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export default async function AssistantPage({
  params
}: {
  params: { id: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const assistant = await getAssistantByHashId(
    parseIdFromSlug(params.id),
    supabase
  )

  return (
    <ChatbotUIChatProvider id={"one"}>
      <Dashboard>
        <ChatUI selectedAssistant={assistant} />
      </Dashboard>
    </ChatbotUIChatProvider>
  )
}
