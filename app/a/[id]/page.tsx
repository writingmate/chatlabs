import { ChatUI } from "@/components/chat/chat-ui"
import { Dashboard } from "@/components/ui/dashboard"
import { getAssistantById } from "@/db/assistants"
import { parseIdFromSlug } from "@/db/lib/slugify"
import { ChatbotUIChatProvider } from "@/context/chat"

export default async function AssistantPage({
  params
}: {
  params: { id: string }
}) {
  const assistant = await getAssistantById(parseIdFromSlug(params.id))

  return (
    <ChatbotUIChatProvider id={"one"}>
      <Dashboard>
        <ChatUI selectedAssistant={assistant} />
      </Dashboard>
    </ChatbotUIChatProvider>
  )
}
