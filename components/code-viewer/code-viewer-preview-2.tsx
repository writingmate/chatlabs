import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { ChatbotUIChatContext } from "@/context/chat"
import { CodeBlock } from "@/types"
import {
  IconAlertTriangle,
  IconClick,
  IconTerminal2,
  IconX
} from "@tabler/icons-react"

import { MessageHtmlElement } from "@/types/html"
import { updateHtml } from "@/lib/code-viewer"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { ButtonWithTooltip } from "../ui/button-with-tooltip"
import { UITheme } from "./theme-configurator"

interface PreviewProps2 {
  codeBlock: CodeBlock
  inspectMode: boolean
  showFooter?: boolean
  theme?: string
  setInspectMode: (inspectMode: boolean) => void
  onElementClick: (element: MessageHtmlElement) => void
  handleFixError: (errors: string[], consoleMessages: string[]) => void
}

const CodeViewerPreview2: React.FC<PreviewProps2> = ({
  codeBlock,
  inspectMode,
  showFooter = true,
  theme,
  setInspectMode,
  onElementClick,
  handleFixError
}) => {
  const { chatMessages } = useContext(ChatbotUIChatContext)
  const chatId = chatMessages[0]?.message?.chat_id || "default"

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const consoleEndRef = useRef<HTMLDivElement | null>(null)
  const renderRef = useRef<string>("")
  const [consoleMessages, setConsoleMessages] = useState<string[]>([])
  const [isConsoleExpanded, setIsConsoleExpanded] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const [ignoredErrors, setIgnoredErrors] = useState<Record<string, string[]>>(
    {}
  )

  // Scroll to the bottom of the console whenever a new message is added
  useEffect(() => {
    if (
      consoleEndRef.current &&
      consoleMessages.length > 0 &&
      isConsoleExpanded
    ) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [consoleMessages, isConsoleExpanded])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const iframeWindow = iframe.contentWindow
    if (!iframeWindow) return

    theme = theme || ""
    if (renderRef.current === codeBlock.code + theme) {
      console.info("Skipping render")
      return
    }

    renderRef.current = codeBlock.code + theme

    const dom = new DOMParser().parseFromString(codeBlock.code, "text/html")

    const styleElement = dom.createElement("style")
    styleElement.textContent = `
            .highlighted {
              outline: dashed 1px blue;
            }
          `

    if (theme) dom.documentElement.setAttribute("data-theme", theme)

    dom.head.appendChild(styleElement)

    updateHtml(dom)

    iframe.srcdoc = dom.documentElement.outerHTML

    const captureConsole = (methodName: keyof Console, messageType: string) => {
      const originalMethod = iframeWindow.console[methodName]
      iframeWindow.console[methodName] = (...args: any[]) => {
        setConsoleMessages(prevMessages => [
          ...prevMessages,
          `[${messageType}] ${args.join(" ")}`
        ])
        originalMethod.apply(iframeWindow.console, args)
        if (methodName === "error") {
          setErrors(prevErrors => [...prevErrors, `[ERROR] ${args.join(" ")}`])
        }
      }
    }

    iframe.onload = () => {
      // Capture different types of console messages
      captureConsole("log", "LOG")
      captureConsole("warn", "WARN")
      captureConsole("error", "ERROR")
      captureConsole("info", "INFO")

      const originalFetch = iframeWindow.fetch

      iframeWindow.fetch = async (...args) => {
        const response = await originalFetch(...args)
          .then(response => {
            if (response.status >= 400) {
              return Promise.reject(response)
            }
            return response
          })
          .catch(error => {
            setErrors(prevErrors => [
              ...prevErrors,
              `[ERROR] Failed to fetch: ${JSON.stringify(error)}. ${JSON.stringify(args)}`
            ])
            return Promise.reject(error)
          })

        return response
      }

      // Capture unhandled errors
      // @ts-ignore
      iframeWindow.onerror = (
        message: string,
        source: string,
        lineno: number,
        colno: number,
        error: Error
      ) => {
        setErrors(prevErrors => [
          ...prevErrors,
          `[ERROR] ${message} at ${source}:${lineno}:${colno}`
        ])
        setConsoleMessages(prevMessages => [
          ...prevMessages,
          `[ERROR] ${message} at ${source}:${lineno}:${colno}`
        ])
      }
    }

    return () => {
      // Reset console methods to original
      ;["log", "warn", "error", "info"].forEach(methodName => {
        const originalMethod = console[methodName as keyof Console]
        if (iframeWindow) {
          iframeWindow.console[methodName as keyof Console] = originalMethod
        }
      })
    }
  }, [codeBlock, inspectMode, theme])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return
    const iframeWindow = iframe.contentWindow
    if (!iframeWindow) return

    const handleMouseOver = (event: MouseEvent) => {
      if (inspectMode) {
        ;(event.target as HTMLElement).classList.add("highlighted")
      }
    }

    const handleMouseOut = (event: MouseEvent) => {
      if (inspectMode) {
        ;(event.target as HTMLElement).classList.remove("highlighted")
      }
    }

    function getElementXPath(element: HTMLElement): string {
      if (
        element.id !== "" &&
        element.id !== null &&
        element.id !== undefined
      ) {
        return 'id("' + element.id + '")'
      }
      if (element.tagName === "BODY") {
        return "/body"
      }

      var ix = 0
      var siblings = element.parentNode?.childNodes
      if (!siblings) return ""
      for (var i = 0; i < siblings.length; i++) {
        var sibling = siblings[i] as HTMLElement
        if (sibling === element) {
          if (element.parentNode === null) return ""
          return (
            getElementXPath(element.parentNode as HTMLElement) +
            "/" +
            element.tagName.toLowerCase() +
            "[" +
            (ix + 1) +
            "]"
          )
        }
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
          ix++
        }
      }

      return ""
    }

    const handleClick = (event: MouseEvent) => {
      if (inspectMode) {
        event.preventDefault()
        event.stopImmediatePropagation() // Ensures no other click events are triggered
        const target = event.target as HTMLElement
        if (target) {
          onElementClick({
            xpath: getElementXPath(target),
            innerText: target.innerText
          })
        }
      }
    }

    doc.addEventListener("mouseover", handleMouseOver)
    doc.addEventListener("mouseout", handleMouseOut)
    doc.addEventListener("click", handleClick, true) // Use capture phase

    // Cleanup function to remove event listeners and reset console methods
    return () => {
      doc.removeEventListener("mouseover", handleMouseOver)
      doc.removeEventListener("mouseout", handleMouseOut)
      doc.removeEventListener("click", handleClick, true)
    }
  }, [inspectMode, onElementClick])

  useEffect(() => {
    // Load ignored errors from local storage
    const storedIgnoredErrors = localStorage.getItem("ignoredErrors")
    if (storedIgnoredErrors) {
      setIgnoredErrors(JSON.parse(storedIgnoredErrors))
    }
  }, [])

  const handleIgnoreError = useCallback(
    (error: string) => {
      const updatedIgnoredErrors = {
        ...ignoredErrors,
        [chatId]: [...(ignoredErrors[chatId] || []), error]
      }
      setIgnoredErrors(updatedIgnoredErrors)
      localStorage.setItem(
        "ignoredErrors",
        JSON.stringify(updatedIgnoredErrors)
      )
      setErrors(prevErrors => prevErrors.filter(e => e !== error))
    },
    [ignoredErrors, chatId, errors, setIgnoredErrors, setErrors, localStorage]
  )

  const activeErrors = errors.filter(
    error => !ignoredErrors[chatId]?.includes(error)
  )

  return useMemo(
    () => (
      <div className="relative flex h-full min-h-[400px] flex-col">
        <iframe ref={iframeRef} className="flex-1 bg-white" />

        {activeErrors.length > 0 && (
          <div className="absolute bottom-16 right-4 flex items-center space-x-2 rounded-md bg-red-100 p-2 text-red-800">
            <IconAlertTriangle size={20} />
            <span className="text-sm font-medium">
              Looks like you have encountered an error
            </span>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleFixError(activeErrors, consoleMessages)}
            >
              Try fixing it
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-500 text-red-500"
              onClick={() =>
                handleIgnoreError(activeErrors[activeErrors.length - 1])
              }
            >
              Ignore it
            </Button>
          </div>
        )}

        <div
          className={`bg-accent text-foreground overflow-auto border-t font-mono text-xs transition-all duration-300 ${
            isConsoleExpanded ? "h-48 px-4 pb-4" : "h-0 p-0"
          }`}
        >
          <div className="bg-accent sticky top-0 flex items-center justify-between py-2">
            <span>Console</span>
            <Button
              size={"icon"}
              variant={"link"}
              className="text-foreground size-5 hover:opacity-50 active:opacity-75"
              onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
            >
              <IconX />
            </Button>
          </div>
          {consoleMessages.map((msg, index) => (
            <div className={"text-nowrap"} key={index}>
              {msg}
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>
        {showFooter && (
          <div className="bg-accent text-foreground flex items-center justify-end space-x-3 p-3 px-4">
            <ButtonWithTooltip
              tooltip="Highlight elements to chat about them"
              variant="link"
              size={"icon"}
              className={cn(
                "size-6 hover:opacity-50 active:opacity-75",
                inspectMode && "bg-violet-500/20 text-violet-500"
              )}
              onClick={() => setInspectMode(!inspectMode)}
            >
              <IconClick size={16} stroke={1.5} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              tooltip="Toggle Console"
              variant="link"
              size={"icon"}
              className={cn(
                "console-toggle size-6 hover:opacity-50 active:border-violet-500 active:opacity-75",
                isConsoleExpanded && "bg-violet-500/20 text-violet-500"
              )}
              onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
            >
              <IconTerminal2 size={16} stroke={1.5} />
            </ButtonWithTooltip>
          </div>
        )}
      </div>
    ),
    [
      activeErrors,
      errors,
      ignoredErrors,
      isConsoleExpanded,
      consoleMessages,
      consoleEndRef,
      iframeRef,
      inspectMode,
      isConsoleExpanded,
      onElementClick,
      setInspectMode,
      showFooter,
      theme,
      handleIgnoreError,
      handleFixError
    ]
  )
}

export default CodeViewerPreview2
