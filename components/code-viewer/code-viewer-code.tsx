import React, { FC, useState, useEffect, useCallback, useRef } from "react"
import CodeMirror, {
  EditorView,
  ReactCodeMirrorRef
} from "@uiw/react-codemirror"
import { oneDark } from "@codemirror/theme-one-dark"
import { javascript } from "@codemirror/lang-javascript"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { sql } from "@codemirror/lang-sql"
import { cpp } from "@codemirror/lang-cpp"
import { csharp } from "@replit/codemirror-lang-csharp"
import { php } from "@codemirror/lang-php"
import { CodeBlock } from "@/types"
import { debounce } from "@/lib/debounce"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"

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
  const ref = useRef<ReactCodeMirrorRef>(null)

  useEffect(() => {
    setCode(initialValue.trim())
  }, [initialValue])

  const getLanguageExtension = (lang: string) => {
    console.log("lang", lang)
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
