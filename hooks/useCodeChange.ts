import { useCallback, useContext } from 'react'
import { ChatbotUIChatContext } from "@/context/chat"
import { CodeBlock } from "@/types/chat-message"
import { updateMessage } from "@/db/messages"
import { reconstructContentWithCodeBlocks } from "@/lib/messages"

export const useCodeChange = (selectedCodeBlock: CodeBlock | null, setSelectedCodeBlock: (codeBlock: CodeBlock | null) => void) => {
    const { chatMessages, setChatMessages } = useContext(ChatbotUIChatContext)

    const handleCodeChange = useCallback((updatedCode: string): void => {
        if (selectedCodeBlock) {
            const updatedMessage = chatMessages?.find(
                message => message.message?.id === selectedCodeBlock.messageId
            )
            if (
                updatedMessage &&
                updatedMessage.codeBlocks &&
                updatedMessage.codeBlocks.length > 0
            ) {
                updatedMessage.codeBlocks[updatedMessage.codeBlocks.length - 1].code =
                    updatedCode
                setChatMessages(prev => {
                    const updatedMessages = [...prev]
                    const index = updatedMessages.findIndex(
                        message => message.message?.id === selectedCodeBlock.messageId
                    )
                    if (index !== -1) {
                        updatedMessages[index] = updatedMessage
                    }
                    return updatedMessages
                })
                setSelectedCodeBlock(
                    updatedMessage.codeBlocks[updatedMessage.codeBlocks.length - 1]
                )
                updateMessage(updatedMessage.message!.id, {
                    content: reconstructContentWithCodeBlocks(
                        updatedMessage.message?.content || "",
                        updatedMessage.codeBlocks
                    )
                })
            }
        }
    }, [selectedCodeBlock, chatMessages, setChatMessages, setSelectedCodeBlock])

    return handleCodeChange
}