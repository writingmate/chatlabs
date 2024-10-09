"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { ReactNode, useContext, useEffect, useState } from "react"
import { ChatbotUIChatProvider } from "@/context/chat"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import Transition from "@/components/ui/transition"

interface ChatLayoutProps {
  children: ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const pathname = usePathname()
  return (
    <ChatbotUIChatProvider id={"one"}>
      <Dashboard>
        <Transition>{children}</Transition>
      </Dashboard>
    </ChatbotUIChatProvider>
  )
}
