import { ChatUI } from "@/components/chat/chat-ui"
import { Dashboard } from "@/components/ui/dashboard"
import { getAssistantById } from "@/db/assistants"
import { getPromptById } from "@/db/prompts"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default async function PromptsPage({
  params
}: {
  params: { id: string }
}) {
  const prompt = await getPromptById(params.id)

  const redirectAction = async () => {
    "use server"
    redirect(`/chat?prompt_id=${prompt.id}`)
  }

  return (
    <Dialog open={true}>
      <DialogContent>
        <form>
          <DialogHeader>
            <DialogTitle>{prompt.name}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {prompt.description}
            {prompt.content}

            <Button formAction={redirectAction}>Use this prompt</Button>
          </DialogDescription>
        </form>
      </DialogContent>
    </Dialog>
  )
}
