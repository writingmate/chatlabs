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
  selectedModelId: LLMID
  selectedTools: Tables<"tools">[]
  onSelectTools: (tools: Tables<"tools">[]) => void
}

function ToolDetails({ tool }: { tool: Tables<"tools"> }) {
  return (
    <div className="mr-2 hidden w-[240px] flex-col space-y-1 border-r px-2 py-1 sm:flex">
      <div className="font-semibold">{tool.name}</div>
      <div className="text-xs">{tool.description}</div>
    </div>
  )
}

export const ToolSelect: FC<ToolSelectProps> = ({
  selectedModelId,
  selectedTools,
  onSelectTools,
  className
}) => {
  const { profile, tools, setIsPaywallOpen } = useContext(ChatbotUIContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [flash, setFlash] = useState(false)

  const [isOpen, setIsOpen] = useState(false)

  const [hoveredTool, setHoveredTool] = useState<Tables<"tools">>(tools[0])

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
    if (!validatePlanForTools(profile, [tool], selectedModelId)) {
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

  if (!tools || tools.length == 0) return null

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          className={cn(
            "relative flex items-center justify-between space-x-0 border-0",
            flash ? "animate-bounce" : "",
            className
          )}
          variant="ghost"
        >
          <IconPuzzle size={24} stroke={1.5} />
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
        className="relative mx-2 flex max-h-[300px] overflow-auto p-2 sm:-ml-[140px]"
        // style={{ width: triggerRef.current?.offsetWidth }}
      >
        <ToolDetails tool={hoveredTool} />
        <div>
          {tools?.map(tool => {
            return (
              <DropdownMenuItem
                key={tool.id}
                onMouseEnter={() => setHoveredTool(tool as Tables<"tools">)}
                className={"flex w-full justify-between space-x-3"}
              >
                <div>{tool.name}</div>
                <Switch
                  checked={selectedTools.some(t => t.id === tool.id)}
                  onClick={e => e.stopPropagation()}
                  onCheckedChange={createHandleSelectTool(tool)}
                />
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
