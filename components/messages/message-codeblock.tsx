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
  IconStars,
  IconWand,
  IconWorld,
  IconX
} from "@tabler/icons-react"
import {
  FC,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useAuth } from "@/context/auth"
import { ChatbotUIContext } from "@/context/context"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIChatContext } from "@/context/chat"
import { MessageSharingDialog } from "@/components/messages/message-sharing-dialog"
import { useScroll } from "@/components/chat/chat-hooks/use-scroll"
import { Switch } from "@/components/ui/switch"
import Loading from "@/components/ui/loading"

interface MessageCodeBlockProps {
  isGenerating?: boolean
  language: string
  filename?: string
  value: string
  className?: string
  onClose?: () => void
  showCloseButton?: boolean
  autoScroll?: boolean
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

export function CopyButton({
  value,
  title = "Copy to clipboard",
  variant = "link",
  className
}: {
  value: string
  variant?: "link" | "outline"
  title?: string
  className?: string
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  return (
    <Button
      size={"icon"}
      className={cn("size-4 text-red-800 hover:opacity-50", className)}
      variant={variant}
      onClick={() => {
        if (isCopied) return
        copyToClipboard(value)
      }}
    >
      {isCopied ? (
        <IconCheck stroke={1.5} size={16} />
      ) : (
        <IconClipboard stroke={1.5} size={16} />
      )}
    </Button>
  )
}

const MemoizedCodeHighlighter = memo(SyntaxHighlighter)

export const MessageCodeBlock: FC<MessageCodeBlockProps> = memo(
  ({
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
    const [sharing, setSharing] = useState(false)
    const [inspectMode, setInspectMode] = useState(false)
    const [execute, setExecute] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [uniqueIFrameId] = useState(generateRandomString(6, true))

    const [iframeHeight, setIframeHeight] = useState<number | null>(null)

    const { chatMessages, setSelectedHtmlElements } =
      useContext(ChatbotUIChatContext)

    const { messagesEndRef, handleScroll } = useScroll({
      block: "end"
    })

    const { handleSendMessage } = useChatHandler()

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

    const errorHandlingScript = `
      <script>
        window.onerror = function(message, source, lineno, colno, error) {
          window.parent.postMessage({
            type: "error",
            message: message,
            source: source,
            lineno: lineno,
            colno: colno,
            iframeId: "${uniqueIFrameId}"
          }, "*");
          return true;
        };
      </script>
    `

    const highlightScript = `
      <script>
        let inspectModeEnabled = ${inspectMode ? "true" : "false"};

        function initializeHighlighting() {
          function getXPath(element) {
            if (element.id !== "") {
              return 'id("' + element.id + '")';
            }
            if (element === document.body) {
              return element.tagName.toLowerCase();
            }
            var ix = 0;
            var siblings = element.parentNode.childNodes;
            for (var i = 0; i < siblings.length; i++) {
              var sibling = siblings[i];
              if (sibling === element) {
                return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
              }
              if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                ix++;
              }
            }
          }
          
          let lastHighlightedElementCursor = null;

          function handleMouseOver(e) {
            if (!inspectModeEnabled) return;
            if (e.target.style) {
              lastHighlightedElementCursor = e.target.style.cursor;  
              e.target.style.cursor = 'pointer';
              e.target.style.outline = '2px dashed fuchsia';
            }
          }

          function handleMouseOut(e) {
            if (!inspectModeEnabled) return;
            if (e.target.style) {
              e.target.style.cursor = lastHighlightedElementCursor;
              e.target.style.outline = '';
            }
          }

          function handleClick(e) {
            if (!inspectModeEnabled) return;
            e.preventDefault();
            e.stopPropagation();
            let xpath = getXPath(e.target);
            window.parent.postMessage({
              type: 'elementClicked',
              xpath: xpath,
              innerText: e.target.innerText
            }, '*');
          }

          document.body.addEventListener('mouseover', handleMouseOver);
          document.body.addEventListener('mouseout', handleMouseOut);
          document.body.addEventListener('click', handleClick);
        }

        window.addEventListener('message', function(event) {
          if (event.data.type === 'toggleInspectMode') {
            inspectModeEnabled = event.data.enabled;
            if (!inspectModeEnabled) {
              // Clear any remaining outlines when disabling inspect mode
              document.querySelectorAll('*').forEach(el => {
                if (el.style) el.style.outline = '';
              });
            }
          }
        });

        // Run the initialization function when the DOM is fully loaded
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initializeHighlighting);
        } else {
          initializeHighlighting();
        }
      </script>
    `

    function addScriptsToHtml(html: string) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")
      const body = doc.querySelector("body")
      if (body) {
        body.innerHTML = [
          body.innerHTML,
          errorHandlingScript,
          highlightScript
        ].join("")
      }
      return doc.documentElement.outerHTML
    }

    useEffect(() => {
      const receiveMessage = (event: MessageEvent) => {
        if (
          event.data.type === "error" &&
          event.data.iframeId === uniqueIFrameId
        ) {
          setError(
            `Error: ${event.data.message}\nLine: ${event.data.lineno}, Column: ${event.data.colno}`
          )
        } else if (event.data.type === "elementClicked") {
          setSelectedHtmlElements([
            { xpath: event.data.xpath, innerText: event.data.innerText }
          ])
        }
      }
      window.addEventListener("message", receiveMessage)
      return () => {
        window.removeEventListener("message", receiveMessage)
      }
    }, [chatMessages, uniqueIFrameId])

    useEffect(() => {
      const iframe = document.querySelector(
        `iframe[data-id="${uniqueIFrameId}"]`
      ) as HTMLIFrameElement
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: "toggleInspectMode",
            enabled: inspectMode
          },
          "*"
        )
      }
    }, [execute, inspectMode, uniqueIFrameId])

    useEffect(() => {
      if (isGenerating) {
        setExecute(false)
        setInspectMode(false)
      }
    }, [isGenerating])

    return useMemo(
      () => (
        <div
          className={cn(
            "codeblock relative flex size-full flex-col overflow-hidden rounded-xl bg-zinc-950 font-sans shadow-lg",
            className
          )}
        >
          <div className="z-10 flex w-full items-center justify-between bg-zinc-700 px-4 text-white">
            <span className="text-xs lowercase">{language}</span>
            <div className="flex items-center space-x-2 py-3 ">
              {["javascript", "js", "html"].includes(
                language.toLowerCase()
              ) && (
                <>
                  <ToggleGroup
                    disabled={isGenerating}
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
                      disabled={value === ""}
                      className="space-x-1 rounded-l-none border border-l-0 text-xs text-white"
                    >
                      <IconPlayerPlay size={16} stroke={1.5} />
                      <span>Run</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                  {language == "html" && (
                    <>
                      <Button
                        disabled={isGenerating}
                        title={"Share you app with others"}
                        className="bg-transparent px-2 text-xs text-white hover:opacity-50"
                        onClick={() => setSharing(true)}
                        variant="outline"
                        size="xs"
                      >
                        <IconWorld className={"mr-1"} size={16} /> Share
                      </Button>
                    </>
                  )}
                </>
              )}

              <Button
                disabled={isGenerating}
                title={"Download as file"}
                variant="link"
                size="icon"
                className="size-4 text-white hover:opacity-50"
                onClick={downloadAsFile}
              >
                <IconDownload size={16} />
              </Button>

              <CopyButton className={"text-white"} value={value} />

              {showCloseButton && (
                <Button
                  title={"Close"}
                  className="size-4 text-white hover:opacity-50"
                  onClick={() => onClose?.()}
                  variant="link"
                  size="icon"
                >
                  <IconX size={16} />
                </Button>
              )}
            </div>
          </div>
          <div
            className="relative w-full flex-1 overflow-auto"
            // onScroll={handleScroll}
          >
            {execute ? (
              <>
                <iframe
                  data-id={uniqueIFrameId}
                  className={"size-full min-h-[480px] border-none bg-white"}
                  srcDoc={
                    language === "html"
                      ? addScriptsToHtml(value)
                      : `<html lang="en"><body>${errorHandlingScript}<script>${value}</script></body></html>`
                  }
                />
                <div className="absolute right-3 top-2 flex items-center space-x-2">
                  <Switch
                    checked={inspectMode}
                    onCheckedChange={setInspectMode}
                    disabled={!execute}
                  />
                  <span className="text-xs">Inspect</span>
                </div>
              </>
            ) : (
              <MemoizedCodeHighlighter
                language={language}
                style={oneDark}
                customStyle={{
                  overflowY: "auto",
                  margin: 0,
                  height: "100%",
                  background: "transparent",
                  padding: "1rem"
                }}
                preTagProps={{
                  onScroll: handleScroll
                }}
                codeTagProps={{
                  style: {
                    fontSize: "14px",
                    fontFamily: "var(--font-mono)"
                  },
                  ref: autoScroll && value ? messagesEndRef : undefined
                }}
              >
                {value.trim()}
              </MemoizedCodeHighlighter>
            )}
            {isGenerating && (
              <div className={"absolute right-3 top-0 size-10 text-white"}>
                <Loading />
              </div>
            )}
          </div>
          {error && (
            <div className="z-10 max-h-[200px] w-full overflow-auto bg-red-100 px-3 py-2 text-sm text-red-800">
              <div className={"flex h-6 items-center justify-between gap-1"}>
                <Label>Console errors</Label>
                <div className={"flex items-center justify-between space-x-2"}>
                  <Button
                    size={"xs"}
                    variant={"outline"}
                    onClick={() =>
                      handleSendMessage(error, chatMessages, false)
                    }
                    className={
                      "h-6 border-red-800 bg-transparent text-xs hover:opacity-50"
                    }
                  >
                    <IconWand size={16} stroke={1.5} />
                    Fix this
                  </Button>
                  <CopyButton value={error} title={"Copy error message"} />
                </div>
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
          <MessageSharingDialog
            open={sharing}
            setOpen={setSharing}
            user={user}
            selectedWorkspace={selectedWorkspace}
            chatSettings={chatSettings}
            defaultFilename={filename || ""}
            fileContent={value}
          />
        </div>
      ),
      [
        inspectMode,
        isGenerating,
        language,
        value,
        error,
        execute,
        sharing,
        iframeHeight,
        uniqueIFrameId
      ]
    )
  }
)

MessageCodeBlock.displayName = "MessageCodeBlock"
