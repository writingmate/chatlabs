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
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"

interface CodeViewerProps {
  isGenerating?: boolean
  language: string
  filename?: string
  value: string
  className?: string
  onClose?: () => void
  showCloseButton?: boolean
  autoScroll?: boolean
}

export const CodeViewer: FC<CodeViewerProps> = ({
  language,
  value,
  className,
  onClose,
  isGenerating,
  showCloseButton = false,
  filename,
  autoScroll = false
}) => {
  const { user } = useAuth()
  const { selectedWorkspace, chatSettings } = useContext(ChatbotUIContext)
  const { setSelectedHtmlElements } = useContext(ChatbotUIChatContext)
  const { handleSendMessage } = useChatHandler()
  const [sharing, setSharing] = useState(false)
  const [execute, setExecute] = useState(false)
  const [inspectMode, setInspectMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const downloadAsFile = useCallback(() => {
    if (typeof window === "undefined") return
    const fileExtension = programmingLanguages[language] || ".file"
    const suggestedFileName = `file-${generateRandomString(3, true)}${fileExtension}`
    const fileName = window.prompt("Enter file name", suggestedFileName)

    if (!fileName) return

    const blob = new Blob([value], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = fileName
    link.href = url
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [language, value])

  const handleThemeChange = useCallback(
    (theme: UITheme) => {
      const themeMessage = `
\`\`\`theme                  
Change theme to
Font: ${theme.font}
Corner radius: ${theme.cornerRadius}
Font size: ${theme.fontSize}
Color palette: ${theme.colorPalette.join(", ")}
Shadow size: ${theme.shadowSize}
\`\`\`
    `
      handleSendMessage(themeMessage, [], false)
    },
    [handleSendMessage]
  )

  useEffect(() => {
    if (language !== "html") {
      setExecute(false)
    }
  }, [language])

  return useMemo(
    () => (
      <div
        className={cn(
          `codeblock relative flex w-full flex-col overflow-hidden rounded-xl font-sans shadow-lg`,
          className
        )}
      >
        <CodeViewerNavbar
          language={language}
          isGenerating={isGenerating}
          execute={execute}
          setExecute={setExecute}
          setSharing={setSharing}
          onClose={onClose}
          showCloseButton={showCloseButton}
          downloadAsFile={downloadAsFile}
          copyValue={value}
          showShareButton={true}
          onThemeChange={handleThemeChange}
        />
        <div className="relative w-full flex-1 overflow-auto bg-zinc-950">
          {execute ? (
            <CodeViewerPreview2
              value={value}
              language={language}
              inspectMode={inspectMode}
              setInspectMode={setInspectMode}
              onElementClick={element => {
                setSelectedHtmlElements([element])
              }}
              handleFixError={() => {}}
            />
          ) : (
            <CodeViewerCode
              language={language}
              value={value}
              autoScroll={autoScroll}
            />
          )}
        </div>
        <MessageSharingDialog
          open={sharing}
          setOpen={setSharing}
          user={user}
          selectedWorkspace={selectedWorkspace}
          chatSettings={chatSettings}
          defaultFilename={filename || "Untitled"}
          fileContent={value}
        />
      </div>
    ),
    [language, value, execute, inspectMode, error, sharing, isGenerating]
  )
}

CodeViewer.displayName = "CodeViewer"
