"use client"

import { ChatbotUISVG } from "@/components/icons/chatbotui-svg"
import { IconArrowRight } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Brand } from "@/components/ui/brand"

export default function HomePage() {
  const { theme } = useTheme()

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <Brand theme={theme === "dark" ? "dark" : "light"} />

      <Link
        className="mt-4 flex w-[200px] items-center justify-center rounded-md bg-violet-500 p-2 font-semibold text-white"
        href="/login"
      >
        Start Chatting
        <IconArrowRight className="ml-1" size={20} />
      </Link>
    </div>
  )
}
