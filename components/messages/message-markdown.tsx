import React, { FC, useState, useMemo } from "react"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { MessageMarkdownMemoized } from "./message-markdown-memoized"
import rehypeMathjax from "rehype-mathjax"
import { cn } from "@/lib/utils"
import { CodeViewer } from "@/components/code-viewer/code-viewer"
import { Button } from "@/components/ui/button"
import { FileIcon } from "@/components/ui/file-icon"
import { CodeBlock } from "@/types/chat-message"
import Loading from "@/components/ui/loading"

interface MessageMarkdownProps {
  isGenerating?: boolean
  content: string
  codeBlocks?: CodeBlock[]
  onSelectCodeBlock?: (codeBlock: CodeBlock | null) => void
}

const CodeBlockButton: FC<
  CodeBlock & { onClick: () => void; loading: boolean }
> = ({ language, filename, onClick, loading }) => (
  <Button
    variant={"outline"}
    size={"lg"}
    className={
      "text-foreground flex h-auto w-[260px] items-center justify-start space-x-1 overflow-hidden rounded-lg p-3 text-left font-sans hover:shadow"
    }
    onClick={onClick}
  >
    <div className={cn("size-10")}>
      {loading ? (
        <Loading />
      ) : (
        <FileIcon type={filename?.split(".")[1] || language} />
      )}
    </div>
    <div className={"flex flex-col overflow-hidden"}>
      <div>{filename}</div>
      <span className="text-foreground/60 line-clamp-1 text-ellipsis whitespace-pre-wrap text-xs font-normal">
        Click to view file
      </span>
    </div>
  </Button>
)

export const MessageMarkdown: FC<MessageMarkdownProps> = ({
  isGenerating,
  content,
  codeBlocks,
  onSelectCodeBlock
}) => {
  const handleCodeBlockClick = (block: CodeBlock) => {
    onSelectCodeBlock?.(block)
  }

  const contentParts = useMemo(() => {
    const parts = content.split(/(\[CODE_BLOCK_\d+\])/)
    return parts.map((part, index) => {
      const match = part.match(/\[CODE_BLOCK_(\d+)\]/)
      if (match) {
        const blockIndex = parseInt(match[1])
        const block = codeBlocks?.[blockIndex]
        if (!block) {
          return ""
        }
        return (
          <CodeBlockButton
            loading={!!isGenerating}
            key={`code-block-${index}`}
            {...block}
            onClick={() => handleCodeBlockClick(block)}
          />
        )
      }
      return (
        <MessageMarkdownMemoized
          key={`markdown-${index}`}
          className={cn(
            "prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-h-[40px] min-w-full space-y-6 break-words",
            isGenerating ? "generating" : ""
          )}
          remarkPlugins={[
            remarkGfm,
            [remarkMath, { singleDollarTextMath: false }]
          ]}
          rehypePlugins={[rehypeMathjax]}
        >
          {part}
        </MessageMarkdownMemoized>
      )
    })
  }, [content, codeBlocks, isGenerating])

  return <>{contentParts}</>
}
