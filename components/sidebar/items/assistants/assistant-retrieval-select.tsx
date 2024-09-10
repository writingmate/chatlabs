import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { IconBooks, IconCircleCheckFilled } from "@tabler/icons-react"
import { FileIcon } from "lucide-react"
import { FC, useContext } from "react"
import { MultiSelect } from "@/components/ui/multi-select"

interface AssistantRetrievalSelectProps {
  selectedAssistantRetrievalItems: (Tables<"files"> | Tables<"collections">)[]
  onAssistantRetrievalItemsSelect: (
    items: (Tables<"files"> | Tables<"collections">)[]
  ) => void
}

export const AssistantRetrievalSelect: FC<AssistantRetrievalSelectProps> = ({
  selectedAssistantRetrievalItems,
  onAssistantRetrievalItemsSelect
}) => {
  const { files, collections } = useContext(ChatbotUIContext)

  if (!files || !collections) return null

  const allItems = [...files, ...collections]
  const options = allItems.map(item => ({
    value: item.id,
    label: item.name,
    type: "type" in item ? "file" : "collection"
  }))

  return (
    <MultiSelect
      options={options}
      selectedOptions={selectedAssistantRetrievalItems.map(item => ({
        value: item.id,
        label: item.name,
        type: "type" in item ? "file" : "collection"
      }))}
      onChange={selected => {
        const selectedItems = allItems.filter(item =>
          selected.some(s => s.value === item.id)
        )
        onAssistantRetrievalItemsSelect(selectedItems)
      }}
      renderOption={(option, selected, onSelect) => (
        <AssistantRetrievalItemOption
          key={option.value}
          item={allItems.find(item => item.id === option.value)!}
          selected={selected}
          onSelect={onSelect}
        />
      )}
      placeholder="Select files & collections"
      searchPlaceholder="Search files & collections..."
    />
  )
}

interface AssistantRetrievalItemOptionProps {
  item: Tables<"files"> | Tables<"collections">
  selected: boolean
  onSelect: () => void
}

const AssistantRetrievalItemOption: FC<AssistantRetrievalItemOptionProps> = ({
  item,
  selected,
  onSelect
}) => {
  const isFile = "type" in item

  return (
    <div
      className="flex cursor-pointer items-center justify-between py-0.5 hover:opacity-50"
      onClick={onSelect}
    >
      <div className="flex grow items-center truncate">
        <div className="mr-2 min-w-[24px]">
          {isFile ? (
            <FileIcon type={(item as Tables<"files">).type} size={24} />
          ) : (
            <IconBooks size={24} />
          )}
        </div>
        <div className="truncate">{item.name}</div>
      </div>
      {selected && (
        <IconCircleCheckFilled size={20} className="min-w-[30px] flex-none" />
      )}
    </div>
  )
}
