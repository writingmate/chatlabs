import { ApplicationPage } from "@/components/applications/application-page"
import { getApplicationById } from "@/db/applications"
import { createClient } from "@/lib/supabase/server"
import { ChatbotUIChatProvider } from "@/context/chat"

export default async function ApplicationDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const application = await getApplicationById(params.id, supabase)

  if (!application) {
    return <div>Application not found</div>
  }

  return (
    <ChatbotUIChatProvider id={application.id}>
      <ApplicationPage application={application} />
    </ChatbotUIChatProvider>
  )
}
