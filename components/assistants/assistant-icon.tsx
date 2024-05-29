import Image from "next/image"
import { IconRobotFace } from "@tabler/icons-react"
import { useContext } from "react"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { cn } from "@/lib/utils"

const COLOR_CLASSES = [
  "bg-red-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-purple-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-orange-500"
]

// consistent number based on the assistant id (string) of a given range
function getColorIndex(assistantId: string) {
  return (
    assistantId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    COLOR_CLASSES.length
  )
}

export function AssistantIcon({
  assistant,
  size = 28,
  className = ""
}: {
  assistant: Tables<"assistants">
  size?: number
  className?: string
}) {
  const { assistantImages } = useContext(ChatbotUIContext)
  const backgroundColor = COLOR_CLASSES[getColorIndex(assistant.id)]
  return (
    <div
      className={cn(
        `items-center justify-center rounded`,
        className,
        backgroundColor
      )}
    >
      {assistant.image_path ? (
        <Image
          src={
            assistantImages.find(image => image.path === assistant.image_path)
              ?.url || ""
          }
          alt={assistant.name}
          width={size}
          height={size}
          className={`max-w-[${size}px] rounded`}
        />
      ) : (
        <IconRobotFace
          size={size - 2}
          stroke={1.5}
          className="text-background"
        />
      )}
    </div>
  )
}
