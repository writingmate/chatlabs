import { CreateApplicationPage as CreateApplicationPageClient } from "@/components/applications/create-application-page"
import { ChatbotUIChatProvider } from "@/context/chat"

export default function CreateApplicationPage() {
  return (
    <ChatbotUIChatProvider id="new-application">
      <CreateApplicationPageClient />
    </ChatbotUIChatProvider>
  )
}
