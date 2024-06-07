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

export default function PromptsPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const { user } = useAuth()
  const [open, setOpen] = useState(true)
  const [prompt, setPrompt] = useState<Tables<"prompts"> | null>()
  const router = useRouter()

  function onOpenChange() {
    // TODO: Implement router.back()
    router.back()
  }

  useEffect(() => {
    if (id) {
      getPromptById(id)
        .then(setPrompt)
        .catch(() => {
          toast.error("Unable to fetch prompt")
        })
    }
  }, [id])

  async function handleCopyPrompt() {
    if (!prompt) {
      return
    }
    copyPrompt(prompt)
      .then(() => {
        toast.info("Prompt copied successfully")
        router.push("/prompts?c=Your Prompts")
        setOpen(false)
      })
      .catch(error => {
        toast.error(error.message)
      })
  }

  if (!prompt) {
    return
  }

  const myPrompt = prompt?.user_id === user?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className={"flex flex-row items-center justify-between"}>
          <DialogTitle>
            {prompt.icon}
            {"  "}
            {prompt.name}{" "}
          </DialogTitle>
          <div className={"flex space-x-1"}>
            {myPrompt && (
              <Button variant={"outline"} size={"xs"}>
                <Link href={`/prompts/${prompt?.id}/edit`}>
                  <IconEdit size={18} stroke={1.5} />
                </Link>
              </Button>
            )}
            {myPrompt && (
              <SidebarDeleteItem
                onDelete={item => deletePrompt(item as Tables<"prompts">)}
                item={prompt}
                contentType={"prompts"}
                trigger={
                  <Button variant={"destructive"} size={"xs"}>
                    <IconTrash size={18} stroke={1.5} />
                  </Button>
                }
              />
            )}
            {!myPrompt && (
              <Button
                onClick={handleCopyPrompt}
                variant={"outline"}
                size={"xs"}
              >
                <IconCopy size={18} stroke={1.5} />
              </Button>
            )}
            <Button size={"xs"}>
              <Link href={`/chat?prompt_id=${prompt.id}`}>Use this prompt</Link>
            </Button>
          </div>
        </DialogHeader>
        <DialogDescription
          className={"text-foreground flex flex-col space-y-3"}
        >
          <div className={"flex flex-col space-y-1"}>
            <Label>Description</Label>
            <div>{prompt.description}</div>
          </div>
          <div className={"flex flex-col space-y-1"}>
            <Label>Prompt</Label>
            <div className={"bg-accent overflow-hidden rounded-md p-3"}>
              <ReactMarkdown className={"overflow-auto"}>
                {prompt.content}
              </ReactMarkdown>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
