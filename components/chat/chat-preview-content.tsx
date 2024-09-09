import { FC, useMemo } from "react"
import { cn } from "@/lib/utils"
import { CodeViewer } from "@/components/code-viewer/code-viewer"
import { CodeBlock } from "@/types/chat-message"

interface ChatPreviewContentProps {
  open: boolean
  isGenerating: boolean
  selectedCodeBlock: CodeBlock | null
  onSelectCodeBlock?: (codeBlock: CodeBlock | null) => void
  isEditable: boolean
  onCodeChange: (updatedCode: string) => void
}

export const ChatPreviewContent: FC<ChatPreviewContentProps> = ({
  open,
  isGenerating,
  selectedCodeBlock,
  onSelectCodeBlock,
  isEditable,
  onCodeChange
}) => {
  return useMemo(
    () => (
      <div
        className={cn(
          "max-w-[50%] shrink-0 overflow-hidden transition-[width] duration-200",
          open ? "w-[100%]" : "w-[0%]"
        )}
      >
        {open && selectedCodeBlock && (
          <CodeViewer
            isGenerating={isGenerating}
            onClose={() => onSelectCodeBlock?.(null)}
            className={"h-full rounded-none"}
            codeBlock={selectedCodeBlock}
            showCloseButton={true}
            autoScroll={true}
            isEditable={isEditable}
            onCodeChange={onCodeChange}
          />
        )}
      </div>
    ),
    [open, isGenerating, selectedCodeBlock, isEditable, onCodeChange]
  )
}
