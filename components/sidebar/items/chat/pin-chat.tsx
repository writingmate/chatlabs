import { FC, useContext, useRef, useState } from "react"
import { ChatbotUIContext } from "@/context/context"
import { updateChat } from "@/db/chats"
import { Tables } from "@/supabase/types"
import { IconEdit, IconPin } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UpdateChatProps {
  chat: Tables<"chats"> & { applications: Tables<"applications">[] }
  className?: string
  setChats: React.Dispatch<
    React.SetStateAction<
      (Tables<"chats"> & { applications?: Tables<"applications">[] })[]
    >
  >
}

export const PinChat: FC<UpdateChatProps> = ({ chat, className, setChats }) => {
  const handlePinChat = async (e: React.MouseEvent<SVGSVGElement>) => {
    const updatedChat = await updateChat(chat.id, {
      pinned: !chat.pinned,
      updated_at: chat.updated_at
    })
    setChats(prevState =>
      prevState.map(c =>
        c.id === chat.id
          ? { ...updatedChat, applications: c.applications || [] }
          : c
      )
    )
  }

  return (
    <IconPin
      className={cn("hover:opacity-50", className)}
      size={18}
      stroke={1.5}
      onClick={handlePinChat}
    />
  )
}
