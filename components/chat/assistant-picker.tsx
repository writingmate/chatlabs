import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { FC, useContext, useEffect, useRef } from "react"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { useClickOutside } from "@/components/chat/picker-hooks/use-click-outside"
import { validatePlanForAssistant } from "@/lib/subscription"
import { AssistantIcon } from "@/components/assistants/assistant-icon"

interface AssistantPickerProps {}

export const AssistantPicker: FC<AssistantPickerProps> = ({}) => {
  const {
    profile,
    assistants,
    focusAssistant,
    atCommand,
    isAssistantPickerOpen,
    setIsAssistantPickerOpen,
    setIsPaywallOpen
  } = useContext(ChatbotUIContext)

  const { handleSelectAssistant } = usePromptAndCommand()

  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (itemsRef.current?.[0]) {
      itemsRef.current[0].focus()
    }
  }, [focusAssistant])

  const filteredAssistants = assistants.filter(assistant =>
    assistant.name.toLowerCase().includes(atCommand.toLowerCase())
  )

  useClickOutside(itemsRef, () => setIsAssistantPickerOpen(false))

  const handleOpenChange = (isOpen: boolean) => {
    setIsAssistantPickerOpen(isOpen)
  }

  const callSelectAssistant = (assistant: Tables<"assistants">) => {
    if (!validatePlanForAssistant(profile, assistant)) {
      setIsPaywallOpen(true)
      return
    }
    handleSelectAssistant(assistant)
    handleOpenChange(false)
  }

  const getKeyDownHandler =
    (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        handleOpenChange(false)
      } else if (e.key === "Enter") {
        e.preventDefault()
        callSelectAssistant(filteredAssistants[index])
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === filteredAssistants.length - 1
      ) {
        e.preventDefault()
        itemsRef.current[0]?.focus()
      } else if (e.key === "ArrowUp" && !e.shiftKey && index === 0) {
        // go to last element if arrow up is pressed on first element
        e.preventDefault()
        itemsRef.current[itemsRef.current.length - 1]?.focus()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex =
          index - 1 >= 0 ? index - 1 : itemsRef.current.length - 1
        itemsRef.current[prevIndex]?.focus()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = index + 1 < itemsRef.current.length ? index + 1 : 0
        itemsRef.current[nextIndex]?.focus()
      } else if (e.key === "Escape") {
        e.preventDefault()
        handleOpenChange(false)
      }
    }

  return (
    <>
      {isAssistantPickerOpen && (
        <div className="flex flex-col border p-2 text-sm shadow-lg">
          {filteredAssistants.length === 0 ? (
            <div className="text-md flex h-14 cursor-pointer items-center justify-center italic hover:opacity-50">
              No matching assistants.
            </div>
          ) : (
            <>
              {filteredAssistants.map((item, index) => (
                <div
                  key={item.id}
                  ref={ref => {
                    itemsRef.current[index] = ref
                  }}
                  tabIndex={0}
                  className="hover:bg-accent focus:bg-accent flex cursor-pointer items-center rounded-lg p-2 focus:outline-none"
                  onClick={() =>
                    callSelectAssistant(item as Tables<"assistants">)
                  }
                  onKeyDown={getKeyDownHandler(index)}
                >
                  <AssistantIcon assistant={item} />
                  <div className="ml-3 flex items-center space-x-2">
                    <div className="text-nowrap font-bold">{item.name}</div>
                    <div className="line-clamp-1 max-w-full overflow-hidden text-ellipsis opacity-60">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </>
  )
}
