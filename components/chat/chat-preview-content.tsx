import React, { FC, memo, useMemo } from "react"
import { cn } from "@/lib/utils"
import { CodeViewer } from "@/components/code-viewer/code-viewer"
import { CodeBlock } from "@/types/chat-message"

interface ChatPreviewContentProps {
  open: boolean
  theme?: string
  isGenerating: boolean
  selectedCodeBlock: CodeBlock | null
  onSelectCodeBlock: (codeBlock: CodeBlock | null) => void
  isEditable: boolean
  onCodeChange: (updatedCode: string) => void
}

export const ChatPreviewContent: FC<ChatPreviewContentProps> = memo(
  ({
    open,
    theme = "light",
    isGenerating,
    selectedCodeBlock,
    onSelectCodeBlock,
    isEditable,
    onCodeChange
  }) => (
    <div
      className={cn(
        "max-w-[50%] shrink-0 overflow-hidden transition-[width] duration-200",
        open ? "w-full" : "w-0"
      )}
    >
      {open && selectedCodeBlock && (
        <CodeViewer
          theme={theme}
          isGenerating={isGenerating}
          onClose={() => onSelectCodeBlock(null)}
          className={"h-full rounded-none"}
          codeBlock={selectedCodeBlock}
          showCloseButton={true}
          autoScroll={isGenerating}
          isEditable={isEditable}
          onCodeChange={onCodeChange}
        />
      )}
    </div>
  )
)

ChatPreviewContent.displayName = "ChatPreviewContent"
