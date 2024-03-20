import Image from "next/image"
import { IconRobotFace } from "@tabler/icons-react"
import { useContext } from "react"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"

export function AssistantIcon({
  assistant,
  size = 28
}: {
  assistant: Tables<"assistants">
  size?: number
}) {
  const { assistantImages } = useContext(ChatbotUIContext)
  return (
    <div className={`w-[${size}px]`}>
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
        <div
          className={`bg-foreground size-[ flex${size}px] items-center justify-center rounded`}
        >
          <IconRobotFace
            size={size - 2}
            stroke={1.5}
            className="text-background"
          />
        </div>
      )}
    </div>
  )
}
