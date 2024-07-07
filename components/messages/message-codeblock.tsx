import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import {
  IconCheck,
  IconClipboard,
  IconCode,
  IconCopy,
  IconDownload,
  IconPlayerPlay,
  IconShare3,
  IconX
} from "@tabler/icons-react"
import { FC, memo, useContext, useEffect, useRef, useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { createFile } from "@/db/files"
import { useAuth } from "@/context/auth"
import { ChatbotUIContext } from "@/context/context"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface MessageCodeBlockProps {
  language: string
  value: string
  className?: string
  onClose?: () => void
}

interface languageMap {
  [key: string]: string | undefined
}

export const programmingLanguages: languageMap = {
  javascript: ".js",
  python: ".py",
  java: ".java",
  c: ".c",
  cpp: ".cpp",
  "c++": ".cpp",
  "c#": ".cs",
  ruby: ".rb",
  php: ".php",
  swift: ".swift",
  "objective-c": ".m",
  kotlin: ".kt",
  typescript: ".ts",
  go: ".go",
  perl: ".pl",
  rust: ".rs",
  scala: ".scala",
  haskell: ".hs",
  lua: ".lua",
  shell: ".sh",
  sql: ".sql",
  html: ".html",
  css: ".css"
}

export const generateRandomString = (length: number, lowercase = false) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXY3456789" // excluding similar looking characters like Z, 2, I, 1, O, 0
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return lowercase ? result.toLowerCase() : result
}

function CopyButton({
  value,
  title = "Copy to clipboard",
  className
}: {
  value: string
  title?: string
  className?: string
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  return (
    <Button
      size={"icon"}
      className="size-4 text-white hover:opacity-50"
      variant={"link"}
      onClick={() => {
        if (isCopied) return
        copyToClipboard(value)
      }}
    >
      {isCopied ? <IconCheck size={16} /> : <IconClipboard size={16} />}
    </Button>
  )
}

export const MessageCodeBlock: FC<MessageCodeBlockProps> = memo(
  ({ language, value, className, onClose }) => {
    const { user } = useAuth()
    const { selectedWorkspace, chatSettings } = useContext(ChatbotUIContext)
    const [sharing, setSharing] = useState(false)

    const [execute, setExecute] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const refIframe = useRef<HTMLIFrameElement>(null)
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [iframeHeight, setIframeHeight] = useState<number | null>(null)

    const downloadAsFile = () => {
      if (typeof window === "undefined") {
        return
      }
      const fileExtension = programmingLanguages[language] || ".file"
      const suggestedFileName = `file-${generateRandomString(
        3,
        true
      )}${fileExtension}`
      const fileName = window.prompt("Enter file name" || "", suggestedFileName)

      if (!fileName) {
        return
      }

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
    }

    const shareHtmlCode = () => {
      if (!selectedWorkspace || !chatSettings || !user) {
        toast.error("Please select a workspace")
        return
      }

      setSharing(true)

      const htmlFile: File = new File([value], "index.html", {
        type: "text/html"
      })

      toast.info("Sharing your code. You will be redirected shortly...")

      const windowRef = window.open("/share/placeholder", "_blank")

      if (!windowRef) {
        toast.error("Failed to open a new window.")
        return
      }

      createFile(
        htmlFile,
        {
          user_id: user.id,
          description: "",
          file_path: "",
          name: htmlFile.name,
          size: htmlFile.size,
          sharing: "public",
          tokens: 0,
          type: "html"
        },
        selectedWorkspace.id,
        chatSettings.embeddingsProvider
      )
        .then(result => {
          toast.success("Your code has been shared successfully.")
          windowRef.location = `/share/${result.hashid}`
        })
        .catch(error => {
          toast.error("Failed to upload.")
          windowRef?.close()
        })
        .finally(() => {
          setSharing(false)
        })
    }

    const sendHeightJS = `
    <script>
    function sendHeight() {
      const height = document.body.scrollHeight;
      if (height !== window.lastSentHeight) {
        window.parent.postMessage({
          type: "resize",
          height: height
        }, "*");
        window.lastSentHeight = height;
      }
    }
    window.addEventListener('load', sendHeight);
    new ResizeObserver(sendHeight).observe(document.body);
    </script>
    `

    const errorHandlingScript = `
      <script>
        window.onerror = function(message, source, lineno, colno, error) {
          window.parent.postMessage({
            type: "error",
            message: message,
            source: source,
            lineno: lineno,
            colno: colno
          }, "*");
          return true;
        };
      </script>
    `

    function addScriptsToHtml(html: string) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")
      const head = doc.querySelector("head")
      if (head) {
        head.innerHTML = errorHandlingScript + head.innerHTML
      }
      const body = doc.querySelector("body")
      if (body) {
        // body.innerHTML += sendHeightJS
        return doc.documentElement.outerHTML
      }
      return html
    }

    useEffect(() => {
      const receiveMessage = (event: MessageEvent) => {
        if (event.data.type === "resize") {
          if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current)
          }
          resizeTimeoutRef.current = setTimeout(() => {
            setIframeHeight(event.data.height)
          }, 200) // Throttle to 200ms
        } else if (event.data.type === "error") {
          setError(
            `Error: ${event.data.message}\nLine: ${event.data.lineno}, Column: ${event.data.colno}`
          )
        }
      }
      window.addEventListener("message", receiveMessage)
      return () => {
        window.removeEventListener("message", receiveMessage)
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current)
        }
      }
    }, [])

    return (
      <div
        className={cn(
          "codeblock relative size-full overflow-hidden bg-zinc-950 font-sans",
          className
        )}
      >
        <div className="z-10 flex w-full items-center justify-between bg-zinc-700 px-4 text-white">
          <span className="text-xs lowercase">{language}</span>
          <div className="flex items-center space-x-2 py-3">
            {["javascript", "js", "html"].includes(language.toLowerCase()) && (
              <>
                <ToggleGroup
                  onValueChange={value => {
                    setExecute(value === "execute")
                    setError(null) // Clear any previous errors when switching modes
                  }}
                  size={"xs"}
                  variant={"default"}
                  className={"gap-0 overflow-hidden rounded-md"}
                  type={"single"}
                  value={execute ? "execute" : "code"}
                >
                  <ToggleGroupItem
                    title={"View the code"}
                    value={"code"}
                    className="space-x-1 rounded-r-none border border-r-0 text-xs text-white"
                  >
                    <IconCode size={16} stroke={1.5} />
                    <span>Code</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    title={"Run the code"}
                    value={"execute"}
                    className="space-x-1 rounded-l-none border border-l-0 text-xs text-white"
                  >
                    <IconPlayerPlay size={16} stroke={1.5} />
                    <span>Run</span>
                  </ToggleGroupItem>
                </ToggleGroup>
                {language == "html" && (
                  <Button
                    title={"Share you app with others"}
                    loading={sharing}
                    className="bg-transparent px-2 text-xs text-white hover:opacity-50"
                    onClick={shareHtmlCode}
                    variant="outline"
                    size="xs"
                  >
                    <IconShare3 className={"mr-1"} size={16} /> Share
                  </Button>
                )}
              </>
            )}

            <Button
              title={"Download as file"}
              variant="link"
              size="icon"
              className="size-4 text-white hover:opacity-50"
              onClick={downloadAsFile}
            >
              <IconDownload size={16} />
            </Button>

            <CopyButton value={value} />

            <Button
              title={"Close"}
              className="size-4 text-white hover:opacity-50"
              onClick={() => onClose?.()}
              variant="link"
              size="icon"
            >
              <IconX size={16} />
            </Button>
          </div>
        </div>
        {error && (
          <div className="absolute bottom-0 max-h-[200px] w-full overflow-auto bg-red-100 px-3 py-2 text-sm text-red-800">
            <div className={"flex h-6 items-center justify-between gap-1"}>
              <Label>Console errors</Label>
              <CopyButton
                className={"text-red-800"}
                value={error}
                title={"Copy error message"}
              />
            </div>
            <div
              className={
                "margin-0 relative whitespace-pre-wrap bg-red-100 font-mono text-xs text-red-800"
              }
            >
              {error}
            </div>
          </div>
        )}
        <div className="relative size-full overflow-auto">
          {execute ? (
            <iframe
              className={"size-full border-none bg-white"}
              srcDoc={
                language === "html"
                  ? addScriptsToHtml(value)
                  : `${errorHandlingScript}<script>${value}</script>${sendHeightJS}`
              }
            />
          ) : (
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{
                overflowY: "auto",
                margin: 0,
                height: "100%",
                background: "transparent",
                padding: "1rem"
              }}
              codeTagProps={{
                style: {
                  fontSize: "14px",
                  fontFamily: "var(--font-mono)"
                }
              }}
            >
              {value}
            </SyntaxHighlighter>
          )}
        </div>
      </div>
    )
  }
)

MessageCodeBlock.displayName = "MessageCodeBlock"
