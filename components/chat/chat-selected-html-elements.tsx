import { useContext } from "react"
import { ChatbotUIChatContext } from "@/context/chat"
import { IconX } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"

export function ChatSelectedHtmlElements() {
  const { selectedHtmlElements, setSelectedHtmlElements } =
    useContext(ChatbotUIChatContext)

  if (!selectedHtmlElements || selectedHtmlElements.length === 0) {
    return null
  }

  const handleRemove = (indexToRemove: number) => {
    setSelectedHtmlElements(prevElements =>
      prevElements.filter((_, index) => index !== indexToRemove)
    )
  }

  return (
    <div className={"mb-2 flex"}>
      {selectedHtmlElements.map((element, index) => (
        <Badge
          key={index}
          className="group relative flex items-center justify-between"
        >
          {element.xpath}
          <button
            onClick={() => handleRemove(index)}
            className="-mr-1 w-0 opacity-0 transition-[width] group-hover:w-3 group-hover:opacity-100"
            aria-label="Remove element"
          >
            <IconX size={14} />
          </button>
        </Badge>
      ))}
    </div>
  )
}
