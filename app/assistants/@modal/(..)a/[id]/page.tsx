"use client"
import { getPromptById } from "@/db/prompts"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { getCurrentUser } from "@/lib/supabase/browser-client"
import { toast } from "sonner"
import { IconCopy, IconEdit, IconTrash } from "@tabler/icons-react"
import { SidebarDeleteItem } from "@/components/sidebar2/items/all/sidebar-delete-item"
import { copyPrompt, deletePrompt } from "@/app/prompts/actions"
import { useAuth } from "@/context/auth"
import { useEffect, useState } from "react"
import { Tables } from "@/supabase/types"
import { useRouter } from "next/navigation"
import { MessageMarkdown } from "@/components/messages/message-markdown"
import { deleteAssistant, getAssistantById } from "@/db/assistants"
import { AssistantIcon } from "@/components/assistants/assistant-icon"

export default function AssistantPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const { user } = useAuth()
  const [open, setOpen] = useState(true)
  const [item, setItem] = useState<Tables<"assistants"> | null>()
  const router = useRouter()

  function onOpenChange() {
    // TODO: Implement router.back()
    router.back()
  }

  useEffect(() => {
    if (id) {
      getAssistantById(id)
        .then(setItem)
        .catch(() => {
          toast.error("Unable to fetch prompt")
        })
    }
  }, [id])

  if (!item) {
    return
  }

  const myItem = item?.user_id === user?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"md:w-[500px] lg:w-[600px] xl:w-[700px]"}>
        <DialogHeader className={"flex flex-row items-center justify-between"}>
          <DialogTitle className={"flex flex-col"}>
            <AssistantIcon assistant={item} />
            {item.name}{" "}
          </DialogTitle>
          <div className={"flex space-x-1"}>
            {myItem && (
              <Button variant={"outline"} size={"xs"}>
                <Link href={`/a/${item?.id}/edit`}>
                  <IconEdit size={18} stroke={1.5} />
                </Link>
              </Button>
            )}
            {myItem && (
              <SidebarDeleteItem
                onDelete={item => deleteAssistant(item.id)}
                item={item}
                contentType={"assistants"}
                trigger={
                  <Button variant={"destructive"} size={"xs"}>
                    <IconTrash size={18} stroke={1.5} />
                  </Button>
                }
              />
            )}
          </div>
        </DialogHeader>
        <div className={"text-foreground flex flex-col space-y-4 text-sm"}>
          <div className={"flex flex-col space-y-2"}>
            <Label>Description</Label>
            <div>{item.description}</div>
          </div>
        </div>
        <Button size={"lg"}>
          <Link href={`/chat?assistant_id=${item.id}`}>Start Chatting</Link>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
