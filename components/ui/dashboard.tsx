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
  const tabValue = searchParams?.get("tab") || "chats"
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

  const handleToggleSidebar = () => {
    setShowSidebar(prevState => !prevState)
    localStorage.setItem("showSidebar", String(!showSidebar))
  }
  ////below is the code for the background of the dashboard and the sidebar
  return useMemo(
    () => (
      <div className="relative flex size-full overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-200 to-orange-600 opacity-15"></div>
        <div className="relative z-10 flex size-full">
          <CommandK />
          <PlanPicker />

          {/* <Button
          className={cn(
            "absolute left-[4px] top-[50%] z-10 size-[32px] cursor-pointer"
          )}
          style={{
            marginLeft: showSidebar ? `${SIDEBAR_WIDTH}px` : "0px",
            transform: showSidebar ? "rotate(180deg)" : "rotate(0deg)"
          }}
          variant="ghost"
          size="icon"
          onClick={handleToggleSidebar}
        >
          <IconChevronCompactRight size={24} />
        </Button> */}

          {/* <div
          className={cn(
            `bg-background absolute z-50 h-full shrink-0 overflow-hidden border-r transition-[width] duration-200 lg:relative`
          )}
          style={{
            width: showSidebar ? `${SIDEBAR_WIDTH}px` : "0px"
          }}
        > */}
          {/* <Tabs
            className={"z-50 flex h-full"}
            value={contentType}
            onValueChange={tabValue => {
              setContentType(tabValue as ContentType)
              router.replace(`${pathname}?tab=${tabValue}`)
            }}
          > */}
          {/* <SidebarSwitcher onContentTypeChange={setContentType} /> */}

          <Sidebar />
          {/* </Tabs> */}
          {/* </div> */}

          <div
            className={"flex grow transition-[width]"}
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
      </div>
    ),
    [showSidebar, contentType, isDragging, children]
  )
}
