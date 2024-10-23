import { FC, useContext } from "react"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { IconCircleCheckFilled, IconPuzzle } from "@tabler/icons-react"

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

  const validTools = tools.filter(tool => tool && tool.id && tool.name)

  return (
    <MultiSelect
      options={validTools.map(tool => ({ value: tool.id, label: tool.name }))}
      selectedOptions={selectedAssistantTools
        .filter(tool => tool && tool.id && tool.name)
        .map(tool => ({
          value: tool.id,
          label: tool.name
        }))}
      onChange={selected => {
        const selectedTools = validTools.filter(tool =>
          selected.some(s => s.value === tool.id)
        )
        onAssistantToolsSelect(selectedTools)
      }}
      renderOption={(option, selected, onSelect) => (
        <AssistantToolItem
          key={option.value}
          tool={validTools.find(t => t.id === option.value)!}
          selected={selected}
          onSelect={onSelect}
        />
      )}
      placeholder="Select plugins"
      searchPlaceholder="Search plugins..."
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
  if (!tool) return null

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
