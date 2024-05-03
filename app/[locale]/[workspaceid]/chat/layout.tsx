"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { ReactNode, useContext, useEffect, useState } from "react"

interface ChatLayoutProps {
  children: ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return <Dashboard>{children}</Dashboard>
}
