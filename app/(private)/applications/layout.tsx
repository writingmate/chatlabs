"use client"

import { ReactNode, useContext, useEffect, useState } from "react"
import { ChatbotUIChatProvider } from "@/context/chat"

import { Dashboard } from "@/components/ui/dashboard"

interface ChatLayoutProps {
  children: ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <ChatbotUIChatProvider id={"one"}>
      <Dashboard>{children}</Dashboard>
    </ChatbotUIChatProvider>
  )
}
