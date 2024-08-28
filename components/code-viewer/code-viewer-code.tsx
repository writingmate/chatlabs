import React, { FC, memo, useMemo } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { useScroll } from "@/components/chat/chat-hooks/use-scroll"

interface CodeViewerProps {
  language: string
  value: string
  autoScroll?: boolean
}

const MemoizedCodeHighlighter = memo(SyntaxHighlighter)

export const CodeViewerCode: FC<CodeViewerProps> = ({
  language,
  value,
  autoScroll
}) => {
  const { messagesEndRef, handleScroll } = useScroll({ block: "end" })

  return useMemo(
    () => (
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
    ),
    [language, value]
  )
}
