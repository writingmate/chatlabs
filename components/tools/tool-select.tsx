import { ChatbotUIContext } from "@/context/context"
import { LLM, LLMID, ModelProvider } from "@/types"
import {
  IconCheck,
  IconChevronDown,
  IconPuzzle,
  IconSettings
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Tables } from "@/supabase/types"
import { Separator } from "@/components/ui/separator"
import { validatePlanForTools } from "@/lib/subscription"
import { cn } from "@/lib/utils"

interface ToolSelectProps {
  className?: string
  selectedTools: Tables<"tools">[]
  onSelectTools: (tools: Tables<"tools">[]) => void
}

export const ToolSelect: FC<ToolSelectProps> = ({
  selectedTools,
  onSelectTools,
  className
}) => {
  const { profile, tools, setIsPaywallOpen } = useContext(ChatbotUIContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [flash, setFlash] = useState(false)

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // FIX: hacky
    }
  }, [isOpen])

  function createHandleSelectTool(tool: Tables<"tools">) {
    return (selected: boolean) => {
      handleSelectTool(tool, selected)
    }
  }
  function handleSelectTool(tool: Tables<"tools">, selected: boolean) {
    if (!validatePlanForTools(profile, [tool])) {
      setIsPaywallOpen(true)
      return
    }
    if (selected) {
      onSelectTools([...selectedTools, tool])
    } else {
      onSelectTools(selectedTools.filter(t => t.id !== tool.id))
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setFlash(true)
      setTimeout(() => {
        setFlash(false)
      }, 500)
    }
  }, [selectedTools])

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
          className={cn(
            "relative flex items-center justify-between space-x-0 border-0",
            flash ? "animate-bounce" : "",
            className
          )}
          variant="ghost"
        >
          <IconPuzzle />
          <div
            className={
              "bg-foreground text-background absolute bottom-1 right-2 size-4 rounded-full text-xs font-semibold"
            }
          >
            {selectedTools.length}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="mx-2 space-y-2 overflow-auto p-2"
        // style={{ width: triggerRef.current?.offsetWidth }}
      >
        <div className="max-h-[300px] overflow-auto">
          {tools.map(tool => {
            return (
              <DropdownMenuItem
                key={tool.id}
                className={"flex w-full justify-between space-x-3"}
              >
                <div>{tool.name}</div>
                <Switch
                  checked={selectedTools.some(t => t.id === tool.id)}
                  onClick={e => e.stopPropagation()}
                  onCheckedChange={createHandleSelectTool(tool)}
                />
                {/*{selectedModelId === model.modelId && (*/}
                {/*  <IconCheck className="ml-2" size={32} />*/}
                {/*)}*/}

                {/*<ModelOption*/}
                {/*  key={model.modelId}*/}
                {/*  model={model}*/}
                {/*  selected={selectedModelId === model.modelId}*/}
                {/*  onSelect={() => handleSelectModel(model.modelId)}*/}
                {/*/>*/}
              </DropdownMenuItem>
            )
          })}
        </div>
        {/*<Separator />*/}
        {/*<DropdownMenuItem className={"flex w-full items-center space-x-2"}>*/}
        {/*  <IconSettings size={16} />*/}
        {/*  <div>Manage tools</div>*/}
        {/*</DropdownMenuItem>*/}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
