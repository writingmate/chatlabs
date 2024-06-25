"use client"
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
import {
  IconCopy,
  IconEdit,
  IconMessageCirclePlus,
  IconTrash
} from "@tabler/icons-react"
import { SidebarDeleteItem } from "@/components/sidebar2/items/all/sidebar-delete-item"
import { copyPrompt, deletePrompt } from "@/app/prompts/actions"
import { useAuth } from "@/context/auth"
import { useEffect, useState } from "react"
import { Tables } from "@/supabase/types"
import { useRouter } from "next/navigation"
import { MessageMarkdown } from "@/components/messages/message-markdown"
import { deleteAssistant, getAssistantById } from "@/db/assistants"
import { AssistantIcon } from "@/components/assistants/assistant-icon"
import { parseIdFromSlug, slugify } from "@/db/lib/slugify"

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
      getAssistantById(parseIdFromSlug(id))
        .then(setItem)
        .catch(() => {
          toast.error("Unable to fetch assistant")
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
        <DialogHeader
          className={
            "relative flex w-full flex-row items-center justify-between"
          }
        >
          <DialogTitle
            className={
              "flex w-full flex-col items-center justify-center space-y-4"
            }
          >
            <AssistantIcon
              size={70}
              className={"border-input size-24 rounded-md border"}
              assistant={item}
            />
            <div>{item.name}</div>
          </DialogTitle>
          <div className={"absolute right-0 top-0 flex space-x-1"}>
            {myItem && (
              <Button variant={"outline"} size={"xs"}>
                <Link href={`/a/${slugify(item)}/edit`}>
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
        <div
          className={
            "text-foreground flex w-full flex-col space-y-4 text-center text-sm"
          }
        >
          {item.description}
        </div>
        <Button size={"lg"}>
          <Link
            className={"text-md flex items-center space-x-2"}
            href={`/chat?assistant_id=${item.id}`}
          >
            <IconMessageCirclePlus size={24} stroke={1.5} />
            <div>Start Chatting</div>
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
