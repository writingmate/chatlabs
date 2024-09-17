"use client"

import { Sidebar } from "@/components/sidebar/sidebar"
import useHotkey from "@/lib/hooks/use-hotkey"
import { ContentType } from "@/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FC, useState, useContext, useMemo, useEffect } from "react"
import { useSelectFileHandler } from "../chat/chat-hooks/use-select-file-handler"
import { CommandK } from "../utility/command-k"
import { PlanPicker } from "@/components/upgrade/plan-picker"
import { useTheme } from "next-themes"
import { ChatbotUIContext } from "@/context/context"

export const SIDEBAR_WIDTH = 350

interface DashboardProps {
  children: React.ReactNode
}

export const Dashboard: FC<DashboardProps> = ({ children }) => {
  useHotkey("s", () => setShowSidebar(prevState => !prevState))

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabValue = searchParams.get("tab") || "chats"
  const { theme } = useTheme()

  const { handleSelectDeviceFile } = useSelectFileHandler()

  const [contentType, setContentType] = useState<ContentType>(
    tabValue as ContentType
  )

  const { showSidebar, setShowSidebar } = useContext(ChatbotUIContext)

  const [isDragging, setIsDragging] = useState(false)

  const onFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const files = event.dataTransfer.files
    const file = files[0]

    handleSelectDeviceFile(file)

    setIsDragging(false)
  }

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return useMemo(
    () => (
      <div className="flex size-full overflow-x-hidden">
        <CommandK />
        <PlanPicker />

        <Sidebar />

        <div
          className="flex grow overflow-hidden transition-[width]"
          style={{
            width: showSidebar ? `calc(100% - ${SIDEBAR_WIDTH}px)` : "100%"
          }}
          onDrop={onFileDrop}
          onDragOver={onDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          {isDragging ? (
            <div className="flex h-full items-center justify-center bg-black/50 text-2xl text-white">
              drop file here
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    ),
    [showSidebar, contentType, isDragging, children]
  )
}
