import { Label } from "@/components/ui/label"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const MAX_CONVERSATION_STARTERS = 10

export function AssistantConversationStarters({
  value,
  onChange
}: {
  value: Array<string>
  onChange: (value: Array<string>) => void
}) {
  const [newStarter, setNewStarter] = useState("")

  const onAddConversationStarter = () => {
    if (newStarter.trim() && value.length < MAX_CONVERSATION_STARTERS) {
      onChange([...value, newStarter.trim()])
      setNewStarter("")
    }
  }

  const onRemoveConversationStarter = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const onChangeConversationStarter = (index: number, newValue: string) => {
    onChange(value.map((item, i) => (i === index ? newValue : item)))
  }

  return (
    <div className="flex flex-col space-y-1 pt-2">
      <Label>Conversation Starters</Label>
      {value.map((conversationStarter, index) => (
        <div key={index} className="flex space-x-1">
          <Input
            value={conversationStarter}
            onChange={e => onChangeConversationStarter(index, e.target.value)}
          />
          <Button
            size="icon"
            variant="destructive"
            onClick={() => onRemoveConversationStarter(index)}
          >
            <IconTrash stroke={1.5} size={18} />
          </Button>
        </div>
      ))}
      {value.length < MAX_CONVERSATION_STARTERS && (
        <div className="flex space-x-1">
          <Input
            className="w-full"
            placeholder="Enter conversation starter"
            value={newStarter}
            onChange={e => setNewStarter(e.target.value)}
            onKeyPress={e => {
              if (e.key === "Enter") {
                onAddConversationStarter()
              }
            }}
          />
          <Button
            size="icon"
            onClick={onAddConversationStarter}
            disabled={value.length >= MAX_CONVERSATION_STARTERS}
          >
            <IconPlus stroke={1.5} size={18} />
          </Button>
        </div>
      )}
    </div>
  )
}
