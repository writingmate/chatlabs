import { FC } from "react"
import Image from "next/image"
interface ChatbotUISVGProps {
  theme: "dark" | "light"
  size: number
  className?: string
}

export const ChatbotUISVG: FC<ChatbotUISVGProps> = ({
  theme,
  size = 141,
  className
}) => {
  return (
    <Image
      src={`/chatlabs.png`}
      alt="ChatLabs"
      className={className}
      width={size}
      height={size}
    />
  )
}
