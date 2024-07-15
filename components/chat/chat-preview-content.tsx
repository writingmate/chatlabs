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
        "fixed bottom-2 right-4 top-14 transition-[width]",
        open ? "w-[calc(100%-30px)] lg:w-[calc(50%-30px)]" : "w-0"
      )}
    >
      {open && content && (
        <MessageCodeBlock
          isGenerating={isGenerating}
          onClose={() => onPreviewContent?.(null)}
          className={"h-full"}
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
