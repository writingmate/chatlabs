import { FC, useContext, useRef, useState } from "react"
import { deleteChat } from "@/db/chats"
import { Tables } from "@/supabase/types"
import { IconTrash } from "@tabler/icons-react"

import useHotkey from "@/lib/hooks/use-hotkey"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"

interface DeleteChatProps {
  chat: Tables<"chats">
  className?: string
  setChats: React.Dispatch<React.SetStateAction<Tables<"chats">[]>>
  handleNewChat: () => void
}

export const DeleteChat: FC<DeleteChatProps> = ({
  chat,
  className,
  setChats,
  handleNewChat
}) => {
  useHotkey("Backspace", () => setShowChatDialog(true))

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [showChatDialog, setShowChatDialog] = useState(false)

  const handleDeleteChat = async () => {
    await deleteChat(chat.id)

    setChats(prevState => prevState.filter(c => c.id !== chat.id))

    setShowChatDialog(false)

    handleNewChat()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      buttonRef.current?.click()
    }
  }

  return (
    <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
      <DialogTrigger asChild>
        <IconTrash
          className={cn("hover:opacity-50", className)}
          stroke={1.5}
          size={18}
        />
      </DialogTrigger>

      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Delete {chat.name}</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete this chat?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowChatDialog(false)}>
            Cancel
          </Button>

          <Button
            ref={buttonRef}
            variant="destructive"
            onClick={handleDeleteChat}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
