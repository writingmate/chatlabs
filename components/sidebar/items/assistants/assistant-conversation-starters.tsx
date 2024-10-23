import { useEffect, useState } from "react"
import { IconTrash } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const MAX_CONVERSATION_STARTERS = 10

export function AssistantConversationStarters({
  value,
  onChange
}: {
  value: Array<string>
  onChange: (value: Array<string>) => void
}) {
  const [starters, setStarters] = useState(value)
  const [newStarter, setNewStarter] = useState("")

  useEffect(() => {
    onChange(starters.filter(starter => starter.trim() !== ""))
  }, [starters, onChange])

  const onChangeConversationStarter = (index: number, newValue: string) => {
    setStarters(prev => {
      const updated = [...prev]
      updated[index] = newValue
      return updated
    })
  }

  const onRemoveConversationStarter = (index: number) => {
    setStarters(prev => prev.filter((_, i) => i !== index))
  }

  const addNewStarter = () => {
    if (newStarter.trim() && starters.length < MAX_CONVERSATION_STARTERS) {
      setStarters(prev => [...prev, newStarter.trim()])
      setNewStarter("")
    }
  }

  return (
    <div className="flex flex-col space-y-1 pt-2">
      <Label>Conversation Starters</Label>
      <div className="text-foreground/80 text-xs">
        Add conversation starters to help users get started. Max 4 shown at
        once. If more than 4, they will be randomly selected.
      </div>
      {starters.map((conversationStarter, index) => (
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
      {starters.length < MAX_CONVERSATION_STARTERS && (
        <div className="flex space-x-1">
          <Input
            className="w-full"
            placeholder="Enter conversation starter"
            value={newStarter}
            onChange={e => setNewStarter(e.target.value)}
            onKeyPress={e => {
              if (e.key === "Enter") {
                addNewStarter()
              }
            }}
            onBlur={addNewStarter}
          />
        </div>
      )}
    </div>
  )
}
