import { FC, memo, useMemo, useState } from "react"
import { cn, isEqual } from "@/lib/utils"
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
  const filename = content?.filename
  const codeString = code.join("\n")

  return useMemo(
    () => (
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
            filename={filename}
            value={codeString}
            showCloseButton={true}
            autoScroll={true}
          />
        )}
      </div>
    ),
    [open, isGenerating, codeString, filename]
  )
}
