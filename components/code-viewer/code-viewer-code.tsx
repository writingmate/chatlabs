import React, { FC, useState, useEffect, useCallback, useRef } from "react"
import CodeMirror, {
  EditorView,
  ReactCodeMirrorRef
} from "@uiw/react-codemirror"
import { oneDark } from "@codemirror/theme-one-dark"
import { javascript } from "@codemirror/lang-javascript"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { useScroll } from "@/components/chat/chat-hooks/use-scroll"
import { CodeBlock } from "@/types"
import { debounce } from "@/lib/debounce"

interface CodeViewerProps {
  codeBlock: CodeBlock
  autoScroll?: boolean
  onCodeChange: (updatedCode: string) => void
  isEditable: boolean
}

export const CodeViewerCode: FC<CodeViewerProps> = ({
  codeBlock: { language, code: initialValue },
  autoScroll,
  onCodeChange,
  isEditable = false
}) => {
  const [code, setCode] = useState(initialValue.trim())
  const { messagesEndRef, handleScroll } = useScroll({ block: "end" })
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const ref = useRef<ReactCodeMirrorRef>(null)

  useEffect(() => {
    setCode(initialValue.trim())
  }, [initialValue])

  const getLanguageExtension = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "javascript":
      case "typescript":
        return javascript()
      case "html":
        return html()
      case "css":
        return css()
      default:
        return javascript() // Default to JavaScript for unknown languages
    }
  }

  const debouncedOnCodeChange = useCallback(
    debounce((value: string) => {
      onCodeChange(value)
    }, 1000),
    [onCodeChange]
  )

  const handleChange = (value: string) => {
    setCode(value)
    debouncedOnCodeChange(value)
  }

  useEffect(() => {
    if (autoScroll && ref.current?.view) {
      ref.current?.view?.dispatch({
        effects: EditorView.scrollIntoView(
          ref.current?.view?.state.doc.length,
          {
            y: "end"
          }
        )
      })
    }
  }, [code, ref, autoScroll])

  return (
    <CodeMirror
      ref={ref}
      value={code}
      height="100%"
      theme={oneDark}
      extensions={[getLanguageExtension(language)]}
      editable={isEditable}
      onChange={handleChange}
      onScroll={handleScroll}
      style={{
        fontSize: "14px",
        fontFamily: "var(--font-mono)",
        height: "100%"
      }}
    />
  )
}
