import React, { useEffect, useRef, useState } from "react"
import {
  IconChevronDown,
  IconChevronUp,
  IconClick,
  IconBulb,
  IconX,
  IconTerminal2
} from "@tabler/icons-react"
import { cn, generateRandomString } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MessageHtmlElement } from "@/types/html"
import { UITheme } from "./theme-configurator"
import { updateHtml } from "@/lib/code-viewer"

interface PreviewProps2 {
  value: string
  language: string
  inspectMode: boolean
  theme: { name: string; theme: UITheme }
  setInspectMode: (inspectMode: boolean) => void
  onElementClick: (element: MessageHtmlElement) => void
  handleFixError: (error: string) => void // New prop for handling error fixes
}

const CodeViewerPreview2: React.FC<PreviewProps2> = ({
  value: fullHtmlContent,
  inspectMode,
  theme,
  setInspectMode,
  onElementClick,
  handleFixError
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const consoleEndRef = useRef<HTMLDivElement | null>(null)
  const renderRef = useRef<string>("")
  const [consoleMessages, setConsoleMessages] = useState<string[]>([])
  const [isConsoleExpanded, setIsConsoleExpanded] = useState<boolean>(false)

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
    if (renderRef.current === fullHtmlContent) return

    renderRef.current = fullHtmlContent

    const dom = new DOMParser().parseFromString(fullHtmlContent, "text/html")

    const styleElement = dom.createElement("style")
    styleElement.textContent = `
            .highlighted {
              outline: dashed 1px blue;
            }
          `
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
      }
    }

    // Capture different types of console messages
    captureConsole("log", "LOG")
    captureConsole("warn", "WARN")
    captureConsole("error", "ERROR")
    captureConsole("info", "INFO")

    // Capture unhandled errors
    // @ts-ignore
    iframeWindow.onerror = (
      message: string,
      source: string,
      lineno: number,
      colno: number,
      error: Error
    ) => {
      setConsoleMessages(prevMessages => [
        ...prevMessages,
        `[ERROR] ${message} at ${source}:${lineno}:${colno}`
      ])
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
  }, [fullHtmlContent, inspectMode])

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

  return (
    <div className="flex h-full min-h-[400px] flex-col">
      <iframe ref={iframeRef} className="flex-1 bg-white" />
      <div
        className={`bg-accent text-foreground overflow-auto border-t font-mono text-xs transition-all duration-300 ${
          isConsoleExpanded ? "h-48 p-4" : "h-0 p-0"
        }`}
      >
        <div className="flex items-center justify-between">
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
      <div className="bg-accent text-foreground flex items-center justify-end space-x-3 p-3 px-4">
        <Button
          size={"icon"}
          variant={"link"}
          className={cn(
            "size-5 hover:opacity-50 active:opacity-75",
            inspectMode && "text-violet-500"
          )}
          onClick={() => setInspectMode(!inspectMode)}
        >
          <IconClick size={16} stroke={1.5} />
        </Button>
        <Button
          variant="link"
          size={"icon"}
          className={cn(
            "console-toggle size-5 hover:opacity-50 active:opacity-75",
            isConsoleExpanded && "text-violet-500"
          )}
          onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
        >
          <IconTerminal2 size={16} stroke={1.5} />
        </Button>
      </div>
    </div>
  )
}

export default CodeViewerPreview2
