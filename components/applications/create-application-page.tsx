"use client"

import React, { useState, useContext, useCallback } from "react"
import { CreateApplication } from "@/components/applications/create-application"
import { ChatPreviewContent } from "@/components/chat/chat-preview-content"
import { Application } from "@/types"
import { CodeBlock } from "@/types/chat-message"
import { ChatbotUIChatContext } from "@/context/chat"
import { useCodeChange } from "@/hooks/useCodeChange"

export const CreateApplicationPage: React.FC = () => {
  const [selectedCodeBlock, setSelectedCodeBlock] = useState<CodeBlock | null>(
    null
  )
  const { isGenerating } = useContext(ChatbotUIChatContext)
  const handleCodeChange = useCodeChange(
    selectedCodeBlock,
    setSelectedCodeBlock
  )

  const handleApplicationCreated = (application: Application) => {
    // Handle application creation logic here
    console.log("Application created:", application)
    // You might want to redirect to the new application's page
  }

  const handleSelectCodeBlock = useCallback(
    (codeBlock: CodeBlock | null): void => {
      setSelectedCodeBlock(codeBlock)
    },
    []
  )

  return (
    <div className="flex h-screen">
      <div className="w-1/2 overflow-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Create New Application</h1>
        <CreateApplication
          onApplicationCreated={handleApplicationCreated}
          onCancel={() => {
            /* Handle cancel action */
          }}
        />
      </div>
      <div className="w-1/2 border-l">
        <ChatPreviewContent
          open={true}
          isGenerating={isGenerating}
          selectedCodeBlock={selectedCodeBlock}
          onSelectCodeBlock={handleSelectCodeBlock}
          isEditable={true}
          onCodeChange={handleCodeChange}
        />
      </div>
    </div>
  )
}
