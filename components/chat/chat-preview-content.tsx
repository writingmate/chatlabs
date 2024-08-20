import { FC, useState } from "react"
import { cn } from "@/lib/utils"
import { CodeViewer } from "@/components/code-viewer/code-viewer"

interface ChatPreviewContentProps {
  open: boolean
  isGenerating: boolean
  content: {
    content: string
    filename?: string
  } | null
  onPreviewContent?: (
    content: {
      content: string
      filename?: string
      update: boolean
    } | null
  ) => void
}
export const ChatPreviewContent: FC<ChatPreviewContentProps> = ({
  open,
  isGenerating,
  content,
  onPreviewContent
}) => {
  const [language, ...code] = content?.content.split("\n") ?? []

  return (
    <div
      className={cn(
        "max-w-[50%] shrink-0 overflow-hidden transition-[width] duration-200",
        open ? "w-[100%]" : "w-[0%]"
      )}
    >
      {open && content && (
        <CodeViewer
          isGenerating={isGenerating}
          onClose={() => onPreviewContent?.(null)}
          className={"h-full rounded-none"}
          language={language}
          filename={content.filename}
          value={code.join("\n")}
          showCloseButton={true}
          autoScroll={true}
        />
      )}
    </div>
  )
}
