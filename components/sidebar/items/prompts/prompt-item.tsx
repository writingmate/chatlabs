import React, { FC, useState } from "react"
import { PROMPT_NAME_MAX } from "@/db/limits"
import { Tables } from "@/supabase/types"
import { IconBulb, IconPencil } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { PinPrompt } from "@/components/sidebar/items/prompts/pin-prompt"

import {
  SIDEBAR_ITEM_ICON_SIZE,
  SIDEBAR_ITEM_ICON_STROKE,
  SidebarItem
} from "../all/sidebar-display-item"

interface PromptItemProps {
  prompt: Tables<"prompts">
  setPrompts: React.Dispatch<React.SetStateAction<Tables<"prompts">[]>>
}

export const PromptItem: FC<PromptItemProps> = ({ prompt, setPrompts }) => {
  const [name, setName] = useState(prompt.name)
  const [content, setContent] = useState(prompt.content)
  const [isTyping, setIsTyping] = useState(false)
  // Function to handle clicks and stop propagation
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation() // Stop event propagation
  }
  return (
    <div onClick={handleClick}>
      {" "}
      {/* Wrap SidebarItem with a div and attach onClick handler */}
      <SidebarItem
        item={prompt}
        isTyping={isTyping}
        contentType="prompts"
        icon={
          <IconBulb
            size={SIDEBAR_ITEM_ICON_SIZE}
            stroke={SIDEBAR_ITEM_ICON_STROKE}
          />
        }
        updateState={{ name, content }}
        renderInputs={() => (
          <>
            <div className="space-y-1">
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

            <div className="space-y-1">
              <Label>Prompt</Label>

              <TextareaAutosize
                placeholder="Prompt..."
                value={content}
                onValueChange={setContent}
                minRows={6}
                maxRows={20}
                onCompositionStart={() => setIsTyping(true)}
                onCompositionEnd={() => setIsTyping(false)}
              />
            </div>
          </>
        )}
        actions={
          <PinPrompt
            className={cn(
              "group-hover:flex group-[.active]:flex",
              prompt.pinned ? "flex" : "hidden"
            )}
            prompt={prompt}
            setPrompts={setPrompts}
          />
        }
      />
    </div>
  )
}
