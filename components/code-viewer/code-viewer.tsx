import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { useAuth } from "@/context/auth"
import { ChatbotUIChatContext } from "@/context/chat"
import { ChatbotUIContext } from "@/context/context"
import { CodeBlock } from "@/types"
import { IconMaximize, IconMinimize } from "@tabler/icons-react" // Import icons for fullscreen

import { cn, generateRandomString, programmingLanguages } from "@/lib/utils"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { CodeViewerCode } from "@/components/code-viewer/code-viewer-code"
import { CodeViewerNavbar } from "@/components/code-viewer/code-viewer-navbar"
import CodeViewerPreview2 from "@/components/code-viewer/code-viewer-preview-2"
import { UITheme } from "@/components/code-viewer/theme-configurator"
import { MessageSharingDialog } from "@/components/messages/message-sharing-dialog"

import { ChatMessages } from "../chat/chat-messages"

interface CodeViewerProps {
  theme?: string
  isGenerating?: boolean
  codeBlock: CodeBlock
  className?: string
  onClose?: () => void
  showCloseButton?: boolean
  autoScroll?: boolean
  isEditable: boolean
  onCodeChange: (
    updatedCode: string,
    messageId: string,
    sequenceNo: number
  ) => void
}

export const CodeViewer: FC<CodeViewerProps> = ({
  codeBlock,
  className,
  theme,
  onClose,
  isGenerating,
  showCloseButton = false,
  autoScroll = false,
  isEditable = false,
  onCodeChange
}) => {
  const { user } = useAuth()
  const { selectedWorkspace, profile, selectedAssistant } =
    useContext(ChatbotUIContext)
  const { setSelectedHtmlElements, chatSettings, chatMessages, selectedChat } =
    useContext(ChatbotUIChatContext)
  const { handleSendMessage } = useChatHandler()
  const [sharing, setSharing] = useState(false)
  const [execute, setExecute] = useState(false)
  const [inspectMode, setInspectMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false) // Add state for fullscreen

  const handleFixError = useCallback(
    (errors: string[], consoleMessages: string[]) => {
      handleSendMessage(
        `We have experienced an error: ${errors.join("\n")}
Browser console messages: ${consoleMessages.join("\n")}
Please fix the error`,
        chatMessages,
        false
      )
    },
    [handleSendMessage]
  )

  const downloadAsFile = useCallback(() => {
    if (typeof window === "undefined") return
    const fileExtension = programmingLanguages[codeBlock.language] || ".file"
    const suggestedFileName = `file-${generateRandomString(3, true)}${fileExtension}`

    const blob = new Blob([codeBlock.code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = suggestedFileName
    link.href = url
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [codeBlock.language, codeBlock.code])

  const onFork = useCallback(() => {
    const queryParams = new URLSearchParams()
    queryParams.append("forkMessageId", codeBlock.messageId)
    queryParams.append("forkSequenceNo", codeBlock.sequenceNo.toString())
    queryParams.append("model", chatSettings?.model || "")
    if (selectedAssistant) {
      queryParams.append("assistant", selectedAssistant?.id)
    }

    window.open(`/chat?${queryParams.toString()}`, "_blank")
  }, [
    codeBlock.messageId,
    codeBlock.sequenceNo,
    chatSettings?.model,
    selectedAssistant
  ])

  useEffect(() => {
    if (codeBlock.language !== "html") {
      setExecute(false)
    }
  }, [codeBlock, isGenerating])

  useEffect(() => {
    if (isGenerating) {
      setExecute(false)
    } else if (!execute && codeBlock.language === "html") {
      setExecute(true)
    }
  }, [isGenerating])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isFullscreen])

  return useMemo(
    () => (
      <div
        className={cn(
          `codeblock relative flex w-full flex-col overflow-hidden rounded-xl font-sans shadow-lg`, // Add transition classes
          className,
          { "absolute top-0 left-0 w-full h-full z-50": isFullscreen } // Very high z-index
        )}
      >
        <CodeViewerNavbar
          filename={codeBlock.filename || ""}
          isEditable={isEditable}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          language={codeBlock.language}
          isGenerating={isGenerating}
          execute={execute}
          setExecute={setExecute}
          setSharing={setSharing}
          onClose={onClose}
          showCloseButton={showCloseButton}
          downloadAsFile={downloadAsFile}
          copyValue={codeBlock.code}
          showShareButton={!!profile}
          onThemeChange={() => {}}
          onFork={onFork}
          showSidebarButton={false}
          showForkButton={
            !!codeBlock.messageId && codeBlock.sequenceNo > -1 && !!profile
          }
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          showFullscreenButton={
            codeBlock.language.toLowerCase() === "html" &&
            !!profile?.experimental_code_editor
          }
        />
        <div className="relative w-full flex-1 overflow-auto bg-zinc-950">
          {execute ? (
            <CodeViewerPreview2
              showFooter={!!profile}
              theme={theme}
              codeBlock={codeBlock}
              inspectMode={inspectMode}
              setInspectMode={setInspectMode}
              onElementClick={element => {
                setSelectedHtmlElements([element])
              }}
              handleFixError={handleFixError}
            />
          ) : (
            <CodeViewerCode
              codeBlock={codeBlock}
              autoScroll={autoScroll}
              onCodeChange={onCodeChange}
              isEditable={isEditable}
            />
          )}
        </div>
        <MessageSharingDialog
          chatId={selectedChat?.id}
          open={sharing}
          setOpen={setSharing}
          user={user}
          selectedWorkspace={selectedWorkspace}
          chatSettings={chatSettings}
          defaultFilename={codeBlock.filename || "Untitled"}
          codeBlock={codeBlock}
        />
      </div>
    ),
    [
      showCloseButton,
      codeBlock,
      execute,
      inspectMode,
      error,
      sharing,
      isGenerating,
      isSidebarOpen,
      theme,
      selectedChat,
      isEditable,
      chatSettings?.model,
      selectedAssistant,
      isFullscreen // Add dependency for fullscreen
    ]
  )
}

CodeViewer.displayName = "CodeViewer"

// Add CSS for fullscreen mode
// .fullscreen-class {
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   z-index: 9999;
//   background-color: #000; // Optional: to cover the entire screen
// }
