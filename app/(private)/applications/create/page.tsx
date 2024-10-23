import { ChatbotUIChatProvider } from "@/context/chat"

import { CreateApplicationPage as CreateApplicationPageClient } from "@/components/applications/create-application-page"

export default function CreateApplicationPage() {
  return (
    <ChatbotUIChatProvider id="new-application">
      <CreateApplicationPageClient />
    </ChatbotUIChatProvider>
  )
}
