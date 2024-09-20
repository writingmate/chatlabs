"use client"

import React, { useState, useContext, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatUI } from "@/components/chat/chat-ui"
import { UpdateApplication } from "@/components/applications/update-application"
import { ChatPreviewContent } from "@/components/chat/chat-preview-content"
import { Tables } from "@/supabase/types"
import { CodeBlock } from "@/types/chat-message"
import { ChatbotUIChatContext } from "@/context/chat"
import { useCodeChange } from "@/hooks/useCodeChange"

interface ApplicationPageProps {
  application: Tables<"applications">
}

export const ApplicationPage: React.FC<ApplicationPageProps> = ({
  application
}) => {
  const [activeTab, setActiveTab] = useState("chat")
  const [selectedCodeBlock, setSelectedCodeBlock] = useState<CodeBlock | null>(
    null
  )
  const { isGenerating } = useContext(ChatbotUIChatContext)
  const handleCodeChange = useCodeChange(
    selectedCodeBlock,
    setSelectedCodeBlock
  )

  const handleUpdateApplication = (
    updatedApplication: Tables<"applications">
  ) => {
    // Handle application update logic here
    console.log("Application updated:", updatedApplication)
  }

  const handleSelectCodeBlock = useCallback(
    (codeBlock: CodeBlock | null): void => {
      setSelectedCodeBlock(codeBlock)
    },
    []
  )

  return (
    <div className="flex h-screen grow">
      <div className="flex h-full w-1/2 flex-col overflow-auto p-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex h-full grow flex-col"
        >
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="edit">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="grow overflow-y-auto">
            <ChatUI
              showModelSelector={false}
              showChatSettings={false}
              showAssistantSelector={false}
              application={application}
              onSelectCodeBlock={handleSelectCodeBlock}
            />
          </TabsContent>
          <TabsContent value="edit" className="grow overflow-y-auto">
            <UpdateApplication
              application={application}
              onUpdateApplication={handleUpdateApplication}
              onCancel={() => setActiveTab("chat")}
            />
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex h-full w-1/2 flex-col overflow-y-auto border-l">
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
