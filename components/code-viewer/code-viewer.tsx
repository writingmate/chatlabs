import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { CodeViewerCode } from "@/components/code-viewer/code-viewer-code"
import { CodeViewerNavbar } from "@/components/code-viewer/code-viewer-navbar"
import CodeViewerPreview2 from "@/components/code-viewer/code-viewer-preview-2"
import { UITheme } from "@/components/code-viewer/theme-configurator"
import { MessageSharingDialog } from "@/components/messages/message-sharing-dialog"
import { useAuth } from "@/context/auth"
import { ChatbotUIChatContext } from "@/context/chat"
import { ChatbotUIContext } from "@/context/context"
import { cn, generateRandomString, programmingLanguages } from "@/lib/utils"
import { CodeBlock } from "@/types"
import { useRouter } from "next/navigation"
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"
import CodeViewerSidebar from "./code-viewer-sidebar"
import { DEFAULT_THEME, THEMES } from "./theme-config"
import { updateMessage } from "@/db/messages" // Add this import

interface CodeViewerProps {
  isGenerating?: boolean
  codeBlock: CodeBlock
  className?: string
  onClose?: () => void
  showCloseButton?: boolean
  autoScroll?: boolean
  isEditable: boolean
  onCodeChange: (updatedCode: string) => void
}

export const CodeViewer: FC<CodeViewerProps> = ({
  codeBlock,
  className,
  onClose,
  isGenerating,
  showCloseButton = false,
  autoScroll = false,
  isEditable = false,
  onCodeChange
}) => {
  const { user } = useAuth()
  const router = useRouter()
  const { selectedWorkspace, chatSettings, profile } =
    useContext(ChatbotUIContext)
  const { setSelectedHtmlElements } = useContext(ChatbotUIChatContext)
  const [sharing, setSharing] = useState(false)
  const [execute, setExecute] = useState(false)
  const [inspectMode, setInspectMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<{ name: string; theme: UITheme }>(
    THEMES[0]
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
    window.open(
      `/chat?forkMessageId=${codeBlock.messageId}&forkSequenceNo=${codeBlock.sequenceNo}`,
      "_blank"
    )
  }, [codeBlock.messageId, codeBlock.sequenceNo])

  useEffect(() => {
    if (codeBlock.language !== "html") {
      setExecute(false)
    }
  }, [codeBlock.language])

  return useMemo(
    () => (
      <div
        className={cn(
          `codeblock relative flex w-full flex-col overflow-hidden rounded-xl font-sans shadow-lg`,
          className
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
          showShareButton={true}
          onThemeChange={() => {}}
          onFork={onFork}
          showSidebarButton={!!user?.email?.endsWith("0nam.facebook@gmail.com")}
          showForkButton={!!codeBlock.messageId && codeBlock.sequenceNo > -1}
        />
        <div className="relative w-full flex-1 overflow-auto bg-zinc-950">
          {execute ? (
            <CodeViewerPreview2
              theme={theme}
              value={codeBlock.code}
              language={codeBlock.language}
              inspectMode={inspectMode}
              setInspectMode={setInspectMode}
              onElementClick={element => {
                setSelectedHtmlElements([element])
              }}
              handleFixError={() => {}}
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
        <CodeViewerSidebar
          theme={theme}
          setTheme={setTheme}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <MessageSharingDialog
          open={sharing}
          setOpen={setSharing}
          user={user}
          selectedWorkspace={selectedWorkspace}
          chatSettings={chatSettings}
          defaultFilename={codeBlock.filename || "Untitled"}
          fileContent={codeBlock.code}
        />
      </div>
    ),
    [
      codeBlock.language,
      codeBlock.code,
      execute,
      inspectMode,
      error,
      sharing,
      isGenerating,
      isSidebarOpen,
      theme,
      isEditable
    ]
  )
}

CodeViewer.displayName = "CodeViewer"
