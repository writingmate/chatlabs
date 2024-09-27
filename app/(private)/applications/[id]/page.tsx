import { ApplicationPage } from "@/components/applications/application-page"
import { getApplicationById } from "@/db/applications"
import { createClient } from "@/lib/supabase/server"
import { ChatbotUIChatProvider } from "@/context/chat"
import { notFound } from "next/navigation"

export default async function ApplicationDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const application = await getApplicationById(params.id, supabase)

  if (!application) {
    return notFound()
  }

  return <ApplicationPage application={application} />
}
