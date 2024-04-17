import { ChatbotUIContext } from "@/context/context"
import { ChatSettings, LLM, LLMID, ModelProvider } from "@/types"
import {
  IconAdjustments,
  IconCheck,
  IconChevronDown,
  IconLogout,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          ref={triggerRef}
          className={
            "relative hidden items-center justify-between space-x-0 border-0 sm:flex"
          }
          variant="ghost"
        >
          <IconAdjustments />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="space-y-2 p-4">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between space-x-2">
            <div>Model Settings</div>
          </SheetTitle>
        </SheetHeader>
        <AdvancedContent
          showOverrideSystemPrompt={true}
          chatSettings={chatSettings}
          onChangeChatSettings={onChangeChatSettings}
          showTooltip={true}
        />
      </SheetContent>
    </Sheet>
  )
}
