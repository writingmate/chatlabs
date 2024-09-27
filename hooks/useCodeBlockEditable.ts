import { useCallback, useContext } from 'react'
import { ChatbotUIChatContext } from "@/context/chat"
import { CodeBlock } from "@/types/chat-message"

export const useCodeBlockEditable = () => {
    const { isGenerating, chatMessages } = useContext(ChatbotUIChatContext)

    const isCodeBlockEditable = useCallback(
        (codeBlock: CodeBlock | null): boolean => {
            if (!codeBlock) return false
            // only allow editing if the code block is the last one in the conversation
            // we need to find the last message that has a code block
            const lastMessage = chatMessages
                ?.filter(message => message.codeBlocks && message.codeBlocks.length > 0)
                .pop()
            return lastMessage?.message?.id === codeBlock.messageId && !isGenerating
        },
        [chatMessages, isGenerating]
    )

    return isCodeBlockEditable
}