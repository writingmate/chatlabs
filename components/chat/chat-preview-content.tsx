import { FC } from "react"
import { MessageCodeBlock } from "@/components/messages/message-codeblock"
import { cn } from "@/lib/utils"

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
  // language is the first line of the content
  // the rest is the code

  let language = "",
    code: string[] = []

  if (content) {
    ;[language, ...code] = content.content.split("\n")
  }

  return (
    <div
      className={cn(
        "max-w-[50%] shrink-0 overflow-hidden transition-[width] duration-200",
        open ? "w-[100%]" : "w-[0%]"
      )}
    >
      {open && content && (
        <MessageCodeBlock
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
