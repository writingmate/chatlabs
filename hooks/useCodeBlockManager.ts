import { useState, useCallback, useEffect, useContext, useMemo } from "react"
import { ChatbotUIChatContext } from "@/context/chat"
import { CodeBlock } from "@/types/chat-message"
import { ChatMessage } from "@/types"
import { updateMessage } from "@/db/messages"
import { reconstructContentWithCodeBlocks } from "@/lib/messages"

export function useCodeBlockManager(ignore: ChatMessage[]) {
    const [selectedCodeBlock, setSelectedCodeBlock] = useState<CodeBlock | null>(null)
    const { isGenerating, chatMessages, setChatMessages } = useContext(ChatbotUIChatContext)


    const isEditable = useMemo(() => {
        if (selectedCodeBlock && chatMessages.length > 0) {
            const lastMessage = chatMessages[chatMessages.length - 1]
            const codeBlocks = lastMessage?.codeBlocks
            if (codeBlocks && codeBlocks.length > 0) {
                const lastCodeBlock = codeBlocks[codeBlocks.length - 1]
                if (lastCodeBlock.messageId === selectedCodeBlock.messageId && lastCodeBlock.sequenceNo === selectedCodeBlock.sequenceNo) {
                    return true
                }
            }
        }
        return false
    }, [selectedCodeBlock, chatMessages])

    const handleSelectCodeBlock = useCallback((codeBlock: CodeBlock | null) => {
        setSelectedCodeBlock(codeBlock)
    }, [])

    const handleCodeChange = useCallback((updatedCode: string, messageId: string, sequenceNo: number): void => {

        const updatedMessage = chatMessages.find(
            message => message.message?.id === messageId
        )

        const codeBlock = updatedMessage?.codeBlocks?.[sequenceNo]

        if (updatedMessage && updatedMessage.codeBlocks && codeBlock) {
            const updatedCodeBlock = {
                ...codeBlock,
                code: updatedCode
            }

            updatedMessage.codeBlocks[sequenceNo] = updatedCodeBlock

            setChatMessages(prev => {
                const updatedMessages = [...prev]
                const index = updatedMessages.findIndex(
                    message => message.message?.id === updatedMessage.message?.id
                )

                if (index !== -1) {
                    updatedMessages[index] = updatedMessage
                }
                return updatedMessages
            })
            handleSelectCodeBlock(updatedCodeBlock)
            updateMessage(updatedMessage.message!.id, {
                content: reconstructContentWithCodeBlocks(
                    updatedMessage.message?.content || "",
                    updatedMessage.codeBlocks
                )
            })
        }
    }, [chatMessages, setChatMessages])

    useEffect(() => {
        if (chatMessages.length === 0) {
            return
        }

        if (!isGenerating) {
            return
        }

        const lastMessage = chatMessages[chatMessages.length - 1]
        const codeBlocks = lastMessage?.codeBlocks

        if (!codeBlocks || codeBlocks.length === 0) {
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
            setTimeout(() => {
                handleSelectCodeBlock(lastCodeBlock)
            }, 10)
        }

    }, [isGenerating, chatMessages, selectedCodeBlock])

    return {
        selectedCodeBlock,
        handleSelectCodeBlock,
        handleCodeChange,
        isEditable,
    }
}
