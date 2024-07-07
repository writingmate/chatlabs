import { FC } from "react"
import { MessageCodeBlock } from "@/components/messages/message-codeblock"

interface ChatPreviewContentProps {
  content: string
  onPreviewContent?: (content: string) => void
}
export const ChatPreviewContent: FC<ChatPreviewContentProps> = ({
  content,
  onPreviewContent
}) => {
  // language is the first line of the content
  // the rest is the code
  const [language, ...code] = content.split("\n")

  return (
    <div
      className={
        "fixed bottom-6 right-4 top-12 w-[calc(100%-30px)] overflow-y-auto rounded-lg shadow-lg transition-transform lg:w-[calc(50%-30px)]"
      }
    >
      <MessageCodeBlock
        onClose={() => onPreviewContent?.("")}
        className={"h-full"}
        language={language}
        value={code.join("\n")}
      />
    </div>
  )
}
