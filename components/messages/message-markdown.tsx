import React, { FC, useState, useMemo, useCallback } from "react"
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
import { ImageWithPreview } from "../image/image-with-preview"
import { defaultUrlTransform } from "react-markdown"

interface MessageMarkdownProps {
  isGenerating?: boolean
  content: string
  codeBlocks?: CodeBlock[]
  onSelectCodeBlock?: (codeBlock: CodeBlock | null) => void
  experimental_code_editor?: boolean
}

const CodeBlockButton: FC<
  CodeBlock & { onClick: () => void; loading: boolean }
> = ({ language, filename, onClick, loading }) => (
  <Button
    variant={"outline"}
    size={"lg"}
    className={
      "text-foreground hover:opacity-1 flex h-auto max-w-[300px] items-center justify-start space-x-1 overflow-hidden rounded-lg p-3 text-left font-sans hover:bg-transparent hover:shadow-md"
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
      <div title={filename} className={"truncate"}>
        {filename}
      </div>
      <span className="text-foreground/60 line-clamp-1 text-ellipsis whitespace-pre-wrap text-xs font-normal">
        Click to view file
      </span>
    </div>
  </Button>
)

function urlTransform(url: string) {
  if (url.startsWith("data:")) {
    return url
  }
  return defaultUrlTransform(url)
}

export const MessageMarkdown: FC<MessageMarkdownProps> = ({
  isGenerating,
  content,
  codeBlocks,
  onSelectCodeBlock,
  experimental_code_editor
}) => {
  const handleCodeBlockClick = useCallback(
    (block: CodeBlock) => {
      if (experimental_code_editor) {
        onSelectCodeBlock?.(block)
      }
    },
    [experimental_code_editor, onSelectCodeBlock]
  )

  const contentParts = useMemo(() => {
    const parts = content.split(/(\[CODE_BLOCK_\d+\])/)
    return parts.filter(Boolean).map((part, index) => {
      const match = part.match(/\[CODE_BLOCK_(\d+)\]/)
      if (match) {
        const blockIndex = parseInt(match[1])
        const block = codeBlocks?.[blockIndex]
        if (!block) {
          return null
        }
        if (experimental_code_editor && !!block.filename) {
          return (
            <CodeBlockButton
              loading={!!isGenerating}
              key={`code-block-${index}`}
              {...block}
              onClick={() => handleCodeBlockClick(block)}
            />
          )
        } else {
          return (
            <CodeViewer
              isEditable={false}
              onCodeChange={() => {}}
              key={`code-block-${index}`}
              codeBlock={block}
              isGenerating={isGenerating}
              autoScroll={false}
            />
          )
        }
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
          urlTransform={urlTransform}
          components={{
            a({ children, ...props }) {
              if (typeof children === "string" && /^\d+$/.test(children)) {
                return (
                  <a
                    {...props}
                    title={props.href}
                    target={"_blank"}
                    className="bg-foreground/20 ml-1 inline-flex size-[16px] items-center justify-center rounded-full text-[10px] no-underline"
                  >
                    {children}
                  </a>
                )
              }
              return <a {...props}>{children}</a>
            },
            p({ children }) {
              return (
                <p className="mb-2 whitespace-pre-wrap last:mb-0">{children}</p>
              )
            },
            img({ node, src, ...props }) {
              return <ImageWithPreview src={src!} alt={props.alt || "image"} />
            }
          }}
        >
          {part}
        </MessageMarkdownMemoized>
      )
    })
  }, [content, codeBlocks, isGenerating, experimental_code_editor])

  return <>{contentParts}</>
}
