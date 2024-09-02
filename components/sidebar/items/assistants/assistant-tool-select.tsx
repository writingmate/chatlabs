import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { IconPuzzle, IconCircleCheckFilled } from "@tabler/icons-react"
import { FC, useContext } from "react"
import { MultiSelect } from "@/components/ui/multi-select"

interface AssistantToolSelectProps {
  selectedAssistantTools: Tables<"tools">[]
  onAssistantToolsSelect: (tools: Tables<"tools">[]) => void
}

export const AssistantToolSelect: FC<AssistantToolSelectProps> = ({
  selectedAssistantTools,
  onAssistantToolsSelect
}) => {
  const { tools } = useContext(ChatbotUIContext)

  if (!tools) return null

  return (
    <MultiSelect
      options={tools}
      selectedOptions={selectedAssistantTools}
      onChange={onAssistantToolsSelect}
      renderOption={(tool, selected, onSelect) => (
        <AssistantToolItem
          key={tool.id}
          tool={tool}
          selected={selected}
          onSelect={onSelect}
        />
      )}
      placeholder="Select tools"
      searchPlaceholder="Search tools..."
    />
  )
}

interface AssistantToolItemProps {
  tool: Tables<"tools">
  selected: boolean
  onSelect: () => void
}

const AssistantToolItem: FC<AssistantToolItemProps> = ({
  tool,
  selected,
  onSelect
}) => {
  return (
    <div
      className="flex cursor-pointer items-center justify-between py-0.5 hover:opacity-50"
      onClick={onSelect}
    >
      <div className="flex grow items-center truncate">
        <div className="mr-2 min-w-[24px]">
          <IconPuzzle size={24} />
        </div>
        <div className="truncate">{tool.name}</div>
      </div>
      {selected && (
        <IconCircleCheckFilled size={20} className="min-w-[30px] flex-none" />
      )}
    </div>
  )
}
