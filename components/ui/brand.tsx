"use client"

import Link from "next/link"
import { FC } from "react"
import { ChatbotUISVG } from "../icons/chatbotui-svg"

interface BrandProps {
  theme?: "dark" | "light"
}

export const Brand: FC<BrandProps> = ({ theme = "dark" }) => {
  return (
    <div className="flex cursor-pointer flex-col items-center">
      <div className="mb-2">
        <ChatbotUISVG theme={theme === "dark" ? "dark" : "light"} scale={0.3} />
      </div>

      <div className="text-4xl font-semibold tracking-wide">ChatLabs</div>
      <div className="flex flex-col items-center py-2">
        <div className="text-sm">More than 30 AI models in one place.</div>
        <div className="text-sm">
          Featuring GPT-4o, Claude 3, Gemini Pro, and LLaMa 3.
        </div>
      </div>
    </div>
  )
}
