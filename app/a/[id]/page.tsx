import { ChatUI } from "@/components/chat/chat-ui"
import { Dashboard } from "@/components/ui/dashboard"
import { getAssistantById } from "@/db/assistants"
import { parseIdFromSlug } from "@/db/lib/slugify"

export default async function AssistantPage({
  params
}: {
  params: { id: string }
}) {
  const assistant = await getAssistantById(parseIdFromSlug(params.id))

  return (
    <Dashboard>
      <ChatUI selectedAssistant={assistant} />
    </Dashboard>
  )
}
