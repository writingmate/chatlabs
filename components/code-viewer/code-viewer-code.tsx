import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import { CodeBlock } from "@/types"
import { cpp } from "@codemirror/lang-cpp"
import { css } from "@codemirror/lang-css"
import { html } from "@codemirror/lang-html"
import { java } from "@codemirror/lang-java"
import { javascript } from "@codemirror/lang-javascript"
import { php } from "@codemirror/lang-php"
import { python } from "@codemirror/lang-python"
import { sql } from "@codemirror/lang-sql"
import { oneDark } from "@codemirror/theme-one-dark"
import { csharp } from "@replit/codemirror-lang-csharp"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import CodeMirror, {
  EditorView,
  ReactCodeMirrorRef
} from "@uiw/react-codemirror"

import { debounce } from "@/lib/debounce"

interface CodeViewerProps {
  codeBlock: CodeBlock
  autoScroll?: boolean
  onCodeChange: (
    updatedCode: string,
    messageId: string,
    sequenceNo: number
  ) => void
  isEditable: boolean
}

export const CodeViewerCode: FC<CodeViewerProps> = ({
  codeBlock: { language, code: initialValue, messageId, sequenceNo },
  autoScroll,
  onCodeChange,
  isEditable = false
}) => {
  const [code, setCode] = useState(initialValue.trim())
  const ref = useRef<ReactCodeMirrorRef>(null)

  useEffect(() => {
    setCode(initialValue.trim())
  }, [initialValue])

  const getLanguageExtension = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "javascript":
      case "typescript":
        return javascript({ jsx: true, typescript: true })
      case "html":
        return html()
      case "css":
        return css()
      case "c#":
        return csharp()
      case "c++":
        return cpp()
      case "php":
        return php()
      case "sql":
        return sql()
      case "python":
        return python()
      case "java":
        return java()
      default:
        return javascript({ jsx: true, typescript: true }) // Default to JavaScript for unknown languages
    }
  }

  const debouncedOnCodeChange = useCallback(
    debounce((value: string, messageId: string, sequenceNo: number) => {
      onCodeChange(value, messageId, sequenceNo)
    }, 1000),
    [onCodeChange]
  )

  const handleChange = (value: string) => {
    setCode(value)
    debouncedOnCodeChange(value, messageId, sequenceNo)
  }

  useEffect(() => {
    if (autoScroll && ref.current?.view) {
      const view = ref.current.view
      const doc = view.state.doc
      const lastLine = doc.line(doc.lines)

      view.dispatch({
        effects: EditorView.scrollIntoView(lastLine.from, {
          y: "end"
        })
      })
    }
  }, [code, ref, autoScroll])

  return (
    <CodeMirror
      theme={vscodeDark}
      ref={ref}
      value={code}
      height="100%"
      extensions={[getLanguageExtension(language)]}
      editable={isEditable}
      onChange={handleChange}
      style={{
        fontSize: "14px",
        fontFamily: "var(--font-mono)",
        height: "100%"
      }}
    />
  )
}
