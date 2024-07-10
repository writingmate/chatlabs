import { FC } from "react"
import { MessageCodeBlock } from "@/components/messages/message-codeblock"

interface ChatPreviewContentProps {
  isGenerating: boolean
  content: {
    content: string
    filename?: string
  }
  onPreviewContent?: (
    content: {
      content: string
      filename?: string
    } | null
  ) => void
}
export const ChatPreviewContent: FC<ChatPreviewContentProps> = ({
  isGenerating,
  content,
  onPreviewContent
}) => {
  // language is the first line of the content
  // the rest is the code
  const [language, ...code] = content.content.split("\n")

  return (
    <div
      className={
        "fixed bottom-2 right-4 top-14 w-[calc(100%-30px)] transition-transform lg:w-[calc(50%-30px)]"
      }
    >
      <MessageCodeBlock
        isGenerating={isGenerating}
        onClose={() => onPreviewContent?.(null)}
        className={"h-full"}
        language={language}
        filename={content.filename}
        value={code.join("\n")}
        showCloseButton={true}
      />
    </div>
  )
}
