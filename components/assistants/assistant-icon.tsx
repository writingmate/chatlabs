import Image from "next/image"
import { IconRobotFace } from "@tabler/icons-react"
import { useContext } from "react"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { cn } from "@/lib/utils"

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
  return (
    <div
      className={cn(
        `bg-foreground size-[${size}px] flex shrink-0 items-center justify-center overflow-hidden rounded`,
        className
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
          className={`max-w-[${size}px]`}
        />
      ) : (
        <IconRobotFace
          size={size - size / 8}
          stroke={1.5}
          className="text-background"
        />
      )}
    </div>
  )
}
