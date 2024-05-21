"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { ReactNode, useContext, useEffect, useState } from "react"

interface ChatLayoutProps {
  settings: ReactNode
  children: ReactNode
}

export default function ChatLayout({ children, settings }: ChatLayoutProps) {
  return (
    <Dashboard>
      {settings}
      {children}
    </Dashboard>
  )
}
