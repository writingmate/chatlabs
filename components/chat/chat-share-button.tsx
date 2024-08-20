import React, { useState, useEffect, useContext } from "react"
import { Button } from "@/components/ui/button"
import {
  IconShare,
  IconX,
  IconCopy,
  IconLink,
  IconBrandLinkedin,
  IconBrandFacebook,
  IconBrandReddit,
  IconBrandX,
  IconShare2
} from "@tabler/icons-react"
import { supabase } from "@/lib/supabase/browser-client"
import { ChatbotUIContext } from "@/context/context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ChatbotUIChatContext } from "@/context/chat"
import { updateChat } from "@/db/chats"
import { CopyButton } from "@/components/ui/copy-button"

export const ShareChatButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)
  const { chatMessages, selectedChat } = useContext(ChatbotUIChatContext)

  useEffect(() => {
    if (isDialogOpen) {
      checkIfShared()
    }
  }, [isDialogOpen, selectedChat])

  const checkIfShared = async () => {
    if (!selectedChat) return

    const { data, error } = await supabase
      .from("chats")
      .select("last_shared_message_id")
      .eq("id", selectedChat.id)
      .eq("sharing", "public")
      .single()

    if (data?.last_shared_message_id) {
      setShareUrl(
        `${window.location.origin}/chat/share/${data.last_shared_message_id}`
      )
    } else {
      setShareUrl("")
    }
  }

  const handleShareChat = async () => {
    if (!selectedChat || !profile?.user_id || !selectedWorkspace?.id) return

    setIsLoading(true)

    const lastMessage = chatMessages?.[chatMessages.length - 1]?.message
    if (!lastMessage) {
      setIsLoading(false)
      return
    }

    await updateChat(selectedChat.id, {
      sharing: "public",
      last_shared_message_id: lastMessage.id,
      shared_by: profile.user_id,
      shared_at: new Date().toISOString()
    })

    setShareUrl(`${window.location.origin}/chat/share/${lastMessage.id}`)
    setIsLoading(false)
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl)
  }

  const handleSocialShare = (platform: string) => {
    let url = ""
    const text = "Check out this chat!"

    switch (platform) {
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case "reddit":
        url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(text)}`
        break
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`
        break
    }

    window.open(url, "_blank")
  }

  const handleOpenDialog = async () => {
    setIsDialogOpen(true)
    await checkIfShared()
  }

  const handleDiscoverableChange = async (checked: boolean) => {
    await handleShareChat()
  }

  if (!selectedChat) return null

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            variant={"ghost"}
            onClick={handleOpenDialog}
            title={shareUrl ? "Manage shared chat" : "Share chat"}
          >
            <IconShare2 stroke={1.5} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {shareUrl ? "Update" : "Create"} public link
            </DialogTitle>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="absolute right-4 top-4"
            >
              <IconX className="size-4" />
            </Button>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <p className="text-sm text-gray-500">
              {shareUrl
                ? "The public link to your chat has been updated."
                : "Generate a public link to share your chat."}
            </p>
            <div className="flex items-center space-x-2">
              <Input value={shareUrl} readOnly className="grow" />
              <Button
                loading={isLoading}
                variant="outline"
                onClick={handleShareChat}
              >
                <IconLink className="mr-2 size-4" />
                {shareUrl ? "Update" : "Generate"} link
              </Button>
              {shareUrl && (
                <CopyButton
                  variant={"outline"}
                  className={"text-foreground size-10 shrink-0"}
                  value={shareUrl}
                />
              )}
            </div>
            {shareUrl && (
              <div className="flex justify-center space-x-4">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleSocialShare("linkedin")}
                >
                  <IconBrandLinkedin className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleSocialShare("facebook")}
                >
                  <IconBrandFacebook className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleSocialShare("reddit")}
                >
                  <IconBrandReddit className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleSocialShare("twitter")}
                >
                  <IconBrandX className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
