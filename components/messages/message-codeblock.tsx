import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import {
  IconCheck,
  IconCloudUpload,
  IconCode,
  IconCopy,
  IconDownload,
  IconPlayerPlay,
  IconShare,
  IconShare2,
  IconShare3
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
      title={title}
      variant="link"
      size="sm"
      className={cn(
        "text-xs text-white hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0",
        className
      )}
      onClick={() => {
        if (isCopied) return
        copyToClipboard(value)
      }}
    >
      {isCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
    </Button>
  )
}

export const MessageCodeBlock: FC<MessageCodeBlockProps> = memo(
  ({ language, value }) => {
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
        body.innerHTML += sendHeightJS
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
      <div className="codeblock relative w-full bg-zinc-950 font-sans">
        <div className="sticky top-0 z-10 flex w-full items-center justify-between bg-zinc-700 px-4 text-white">
          <span className="text-xs lowercase">{language}</span>
          <div className="flex items-center space-x-1">
            {["javascript", "js", "html"].includes(language.toLowerCase()) && (
              <>
                <ToggleGroup
                  onValueChange={value => {
                    setExecute(value === "execute")
                    setError(null) // Clear any previous errors when switching modes
                  }}
                  size={"xs"}
                  variant={"default"}
                  className={
                    "gap-0 overflow-hidden rounded-md border border-white"
                  }
                  type={"single"}
                  value={execute ? "execute" : "code"}
                >
                  <ToggleGroupItem
                    title={"View the code"}
                    value={"code"}
                    className="space-x-1 rounded-none border-none text-xs text-white"
                  >
                    <IconCode size={16} stroke={1.5} />
                    <span>Code</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    title={"Run the code"}
                    value={"execute"}
                    className="space-x-1 rounded-none border-none text-xs text-white"
                  >
                    <IconPlayerPlay size={16} stroke={1.5} />
                    <span>Run</span>
                  </ToggleGroupItem>
                </ToggleGroup>
                {language == "html" && (
                  <Button
                    title={"Share you app with others"}
                    loading={sharing}
                    className="text-white hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0"
                    onClick={shareHtmlCode}
                    variant="link"
                    size="icon"
                  >
                    <IconShare3 size={16} />
                  </Button>
                )}
              </>
            )}

            <Button
              title={"Download as file"}
              variant="link"
              size="icon"
              className="text-white hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0"
              onClick={downloadAsFile}
            >
              <IconDownload size={16} />
            </Button>

            <CopyButton value={value} />
          </div>
        </div>
        <div className="relative">
          {execute ? (
            <>
              <iframe
                ref={refIframe}
                className={"w-full border-none bg-white"}
                style={{ height: iframeHeight ? `${iframeHeight}px` : "400px" }}
                srcDoc={
                  language === "html"
                    ? addScriptsToHtml(value)
                    : `${errorHandlingScript}<script>${value}</script>${sendHeightJS}`
                }
              />
              {error && (
                <div className="absolute bottom-0 max-h-[200px] w-full overflow-auto rounded bg-red-100 p-3 text-sm text-red-800">
                  {/* ... (keep error display) */}
                </div>
              )}
            </>
          ) : (
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{
                margin: 0,
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
