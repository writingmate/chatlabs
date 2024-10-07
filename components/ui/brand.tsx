"use client"

import { FC } from "react"
import { ChatbotUISVG } from "../icons/chatbotui-svg"

interface BrandProps {
  theme?: "dark" | "light"
}

export const Brand: FC<BrandProps> = ({ theme = "dark" }) => {
  return (
    <div className="flex cursor-pointer flex-col items-center">
      <div className="mb-2">
        <ChatbotUISVG
          className="rounded-full"
          theme={theme === "dark" ? "dark" : "light"}
          size={141 * 0.3}
        />
      </div>

      <h1 className="text-4xl font-semibold tracking-wide">ChatLabs</h1>
      <div className="flex flex-col items-center py-2">
        <h4 className="text-center text-sm">
          More than 30 AI models in one place.
        </h4>
        <h4 className="text-center text-sm">
          Featuring GPT-4o, Claude 3, Gemini Pro, and LLaMa 3.
        </h4>
      </div>
    </div>
  )
}
