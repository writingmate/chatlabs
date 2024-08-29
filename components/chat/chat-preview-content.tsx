import { FC, useMemo } from "react"
import { cn } from "@/lib/utils"
import { CodeViewer } from "@/components/code-viewer/code-viewer"
import { CodeBlock } from "@/types/chat-message"

interface ChatPreviewContentProps {
  open: boolean
  isGenerating: boolean
  selectedCodeBlock: CodeBlock | null
  onSelectCodeBlock?: (codeBlock: CodeBlock | null) => void
}

export const ChatPreviewContent: FC<ChatPreviewContentProps> = ({
  open,
  isGenerating,
  selectedCodeBlock,
  onSelectCodeBlock
}) => {
  const language = selectedCodeBlock?.language ?? ""
  const filename = selectedCodeBlock?.filename
  const codeString = selectedCodeBlock?.code ?? ""

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
            language={language}
            filename={filename}
            value={codeString}
            showCloseButton={true}
            autoScroll={true}
          />
        )}
      </div>
    ),
    [open, isGenerating, selectedCodeBlock, language, filename, codeString]
  )
}
