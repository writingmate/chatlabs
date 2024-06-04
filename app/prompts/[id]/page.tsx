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

export default async function PromptsPage({
  params
}: {
  params: { id: string }
}) {
  const prompt = await getPromptById(params.id)

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{prompt.name}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {prompt.description}
          {prompt.content}

          <Button>Use this prompt</Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
