import Image from "next/image"
import { useContext } from "react"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { cn } from "@/lib/utils"
import { ChatbotUISVG } from "@/components/icons/chatbotui-svg"
import { useTheme } from "next-themes"
import { getAssistantPublicImageUrl } from "@/db/storage/assistant-images"

export function AssistantIcon({
  assistant,
  size = 28,
  className = ""
}: {
  assistant: Tables<"assistants">
  size?: number
  className?: string
}) {
  const { theme } = useTheme()
  return (
    <div
      className={cn(
        `bg-foreground size-[${size}px] flex shrink-0 items-center justify-center overflow-hidden rounded`,
        className
      )}
    >
      {assistant.image_path ? (
        <Image
          src={getAssistantPublicImageUrl(assistant.image_path)}
          alt={assistant.name}
          width={size}
          height={size}
          className={`max-w-[${size}px]`}
        />
      ) : (
        <ChatbotUISVG
          theme={theme === "dark" ? "light" : "dark"}
          size={size * 0.7}
        />
      )}
    </div>
  )
}
