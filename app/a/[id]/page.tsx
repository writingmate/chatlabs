import { ChatUI } from "@/components/chat/chat-ui"
import { Dashboard } from "@/components/ui/dashboard"
import { getAssistantById } from "@/db/assistants"
import { parseIdFromSlug } from "@/db/lib/slugify"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const assistant = await getAssistantById(parseIdFromSlug(params.id))

  return {
    title: `${assistant.name} - Best AI Assistant for ChatGPT, Claude, Groq, LLaMa`,
    description: `${assistant.description} - Use {assistant.name} with GPT-4o, Claude, LLaMa, Groq`
  }
}

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
