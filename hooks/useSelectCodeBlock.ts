import { useState, useCallback, useEffect } from "react"
import { CodeBlock } from "@/types/chat-message"
import { ChatMessage } from "@/types" // Adjust this import based on your project structure

export function useSelectCodeBlock(chatMessages: ChatMessage[]) {
    const [selectedCodeBlock, setSelectedCodeBlock] = useState<CodeBlock | null>(null)

    const handleSelectCodeBlock = useCallback((codeBlock: CodeBlock | null) => {
        setSelectedCodeBlock(codeBlock)
    }, [])

    useEffect(() => {
        if (chatMessages.length === 0) {
            return
        }
        const lastMessage = chatMessages[chatMessages.length - 1]
        const codeBlocks = lastMessage?.codeBlocks

        if (!codeBlocks || codeBlocks.length === 0) {
            // if (selectedCodeBlock !== null) {
            //     handleSelectCodeBlock(null)
            // }
            return
        }

        const lastCodeBlock = codeBlocks[codeBlocks.length - 1]

        if (
            selectedCodeBlock &&
            lastCodeBlock.filename &&
            (selectedCodeBlock.messageId !== lastCodeBlock.messageId ||
                selectedCodeBlock?.sequenceNo !== lastCodeBlock.sequenceNo ||
                selectedCodeBlock?.code !== lastCodeBlock.code)
        ) {
            handleSelectCodeBlock(lastCodeBlock)
        }

    }, [chatMessages, handleSelectCodeBlock, selectedCodeBlock])

    return { selectedCodeBlock, handleSelectCodeBlock }
}