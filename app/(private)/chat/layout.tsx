"use client"

import { ReactNode, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { ChatbotUIChatProvider } from "@/context/chat"
import { AnimatePresence, motion } from "framer-motion"

import { Dashboard } from "@/components/ui/dashboard"
import Transition from "@/components/ui/transition"

interface ChatLayoutProps {
  children: ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <ChatbotUIChatProvider id={"one"}>
      <Dashboard>
        <Transition>{children}</Transition>
      </Dashboard>
    </ChatbotUIChatProvider>
  )
}
