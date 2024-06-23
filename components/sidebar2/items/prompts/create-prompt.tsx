import { SidebarCreateItem } from "@/components/sidebar2/items/all/sidebar-create-item"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { ChatbotUIContext } from "@/context/context"
import { PROMPT_NAME_MAX } from "@/db/limits"
import { TablesInsert } from "@/supabase/types"
import React, { FC, useContext, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface CreatePromptProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreatePrompt: FC<CreatePromptProps> = ({
  isOpen,
  onOpenChange
}) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)
  const [isTyping, setIsTyping] = useState(false)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [icon, setIcon] = useState("📝")
  const [sharing, setSharing] = useState("private")

  if (!profile) return null
  if (!selectedWorkspace) return null

  return (
    <SidebarCreateItem
      contentType="prompts"
      isOpen={isOpen}
      isTyping={isTyping}
      onOpenChange={onOpenChange}
      createState={
        {
          user_id: profile.user_id,
          name,
          content
        } as TablesInsert<"prompts">
      }
      renderInputs={() => (
        <>
          <div className="space-y-2">
            <Label>Icon</Label>

            <Input
              placeholder="Prompt icon..."
              value={icon}
              onChange={e => setIcon(e.target.value)}
              maxLength={PROMPT_NAME_MAX}
              onCompositionStart={() => setIsTyping(true)}
              onCompositionEnd={() => setIsTyping(false)}
            />
          </div>

          <div className="space-y-2">
            <Label>Name</Label>

            <Input
              placeholder="Prompt name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={PROMPT_NAME_MAX}
              onCompositionStart={() => setIsTyping(true)}
              onCompositionEnd={() => setIsTyping(false)}
            />
          </div>

          <div className="space-y-2">
            <Label>Prompt</Label>

            <TextareaAutosize
              placeholder="Prompt..."
              value={content || ""}
              onValueChange={setContent}
              minRows={6}
              maxRows={20}
              onCompositionStart={() => setIsTyping(true)}
              onCompositionEnd={() => setIsTyping(false)}
            />
          </div>

          <div className="space-y-2">
            <Label>Sharing</Label>

            <Select value={sharing} onValueChange={setSharing}>
              <SelectTrigger>
                {sharing === "public" ? "Public" : "Private"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"public"}>
                  <SelectValue>Public</SelectValue>
                </SelectItem>
                <SelectItem value={"private"}>
                  <SelectValue>Private</SelectValue>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    />
  )
}
