"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { ReactNode, useContext, useEffect, useState } from "react"
import { ChatbotUIChatProvider } from "@/context/chat"

interface ChatLayoutProps {
  children: ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <Dashboard>
      <ChatbotUIChatProvider id={"one"}>{children}</ChatbotUIChatProvider>
    </Dashboard>
  )
}
