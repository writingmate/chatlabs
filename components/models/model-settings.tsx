import { ChatbotUIContext } from "@/context/context"
import { ChatSettings, LLM, LLMID, ModelProvider } from "@/types"
import {
  IconAdjustments,
  IconCheck,
  IconChevronDown,
  IconPuzzle
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { ModelIcon } from "./model-icon"
import { ModelOption } from "./model-option"
import { AdvancedSettings } from "@/components/ui/advanced-settings"
import { AdvancedContent } from "@/components/ui/chat-settings-form"

interface ModelSelectProps {
  chatSettings: ChatSettings
  onChangeChatSettings: (value: ChatSettings) => void
}

export const ModelSettings: FC<ModelSelectProps> = ({
  chatSettings,
  onChangeChatSettings
}) => {
  const { profile } = useContext(ChatbotUIContext)

  const triggerRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)

  if (!profile) return null

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
      }}
    >
      <DropdownMenuTrigger>
        <Button
          ref={triggerRef}
          className={
            "relative flex items-center justify-between space-x-0 border-0"
          }
          variant="ghost"
        >
          <IconAdjustments />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[280px] space-y-2 p-2" align="start">
        {chatSettings && (
          <AdvancedContent
            showOverrideSystemPrompt={true}
            chatSettings={chatSettings}
            onChangeChatSettings={onChangeChatSettings}
            showTooltip={true}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
