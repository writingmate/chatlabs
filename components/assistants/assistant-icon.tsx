import Image from "next/image"
import { IconRobotFace } from "@tabler/icons-react"
import { Tables } from "@/supabase/types"
import { cn } from "@/lib/utils"
import { getAssistantPublicImageUrl } from "@/db/storage/assistant-images"

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
  // const { assistantImages } = useContext(ChatbotUIContext)
  const imageUrl = assistant.image_path
    ? getAssistantPublicImageUrl(assistant.image_path)
    : ""

  const backgroundColor = imageUrl
    ? ""
    : COLOR_CLASSES[getColorIndex(assistant.id)]

  return (
    <div
      className={cn(
        `flex shrink-0 items-center justify-center overflow-hidden rounded`,
        `w-[${size}px] h-[${size}px]`,
        className,
        backgroundColor
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={assistant.name}
          width={size}
          height={size}
          className={`size-full`}
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
