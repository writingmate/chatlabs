"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { ReactNode, useContext, useEffect, useState } from "react"

interface ChatLayoutProps {
  modal: ReactNode
  children: ReactNode
}

export default function ChatLayout({ children, modal }: ChatLayoutProps) {
  return (
    <Dashboard>
      {modal}
      {children}
    </Dashboard>
  )
}
