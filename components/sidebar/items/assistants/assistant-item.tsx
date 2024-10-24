import { FC, useContext, useEffect, useState } from "react"
import Image from "next/image"
import { ChatbotUIContext } from "@/context/context"
import { ASSISTANT_DESCRIPTION_MAX, ASSISTANT_NAME_MAX } from "@/db/limits"
import { Tables } from "@/supabase/types"
import { IconRobotFace } from "@tabler/icons-react"
import profile from "react-syntax-highlighter/dist/esm/languages/hljs/profile"
import ReactTextareaAutosize from "react-textarea-autosize"

import { ChatSettingsForm } from "@/components/ui/chat-settings-form"
import ImagePicker from "@/components/ui/image-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { AssistantIcon } from "@/components/assistants/assistant-icon"
import { SharingField } from "@/components/sidebar/items/all/sharing-field"
import { AssistantConversationStarters } from "@/components/sidebar/items/assistants/assistant-conversation-starters"

import {
  SIDEBAR_ITEM_ICON_SIZE,
  SIDEBAR_ITEM_ICON_STROKE,
  SidebarItem
} from "../all/sidebar-display-item"
import { AssistantRetrievalSelect } from "./assistant-retrieval-select"
import { AssistantToolSelect } from "./assistant-tool-select"

interface AssistantItemProps {
  assistant: Tables<"assistants">
}

export const AssistantItem: FC<AssistantItemProps> = ({ assistant }) => {
  const { selectedWorkspace, assistantImages } = useContext(ChatbotUIContext)

  const [name, setName] = useState(assistant.name)
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState(assistant.description)
  const [assistantChatSettings, setAssistantChatSettings] = useState({
    model: assistant.model,
    prompt: assistant.prompt,
    temperature: assistant.temperature,
    contextLength: assistant.context_length,
    includeProfileContext: assistant.include_profile_context,
    includeWorkspaceInstructions: assistant.include_workspace_instructions
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imageLink, setImageLink] = useState("")
  const [conversationStarters, setConversationStarters] = useState<string[]>(
    assistant.conversation_starters || []
  )
  const [sharing, setSharing] = useState(assistant.sharing || "private")

  useEffect(() => {
    const assistantImage =
      assistantImages.find(image => image.path === assistant.image_path)?.url ||
      ""
    setImageLink(assistantImage)
  }, [assistant, assistantImages])

  const handleFileSelect = (
    files: Tables<"files">[],
    setSelectedAssistantFiles: React.Dispatch<
      React.SetStateAction<Tables<"files">[]>
    >
  ) => {
    setSelectedAssistantFiles(files)
  }

  const handleCollectionSelect = (
    collections: Tables<"collections">[],
    setSelectedAssistantCollections: React.Dispatch<
      React.SetStateAction<Tables<"collections">[]>
    >
  ) => {
    setSelectedAssistantCollections(collections)
  }

  const handleToolSelect = (
    tools: Tables<"tools">[],
    setSelectedAssistantTools: React.Dispatch<
      React.SetStateAction<Tables<"tools">[]>
    >
  ) => {
    // tools is an array of tools currently selected
    // prevState is an array of tools previously selected
    setSelectedAssistantTools(tools)
  }

  if (!profile) return null
  if (!selectedWorkspace) return null

  return (
    <SidebarItem
      item={assistant}
      contentType="assistants"
      isTyping={isTyping}
      icon={
        <AssistantIcon assistant={assistant} size={SIDEBAR_ITEM_ICON_SIZE} />
      }
      updateState={{
        image: selectedImage,
        user_id: assistant.user_id,
        name,
        description,
        include_profile_context: assistantChatSettings.includeProfileContext,
        include_workspace_instructions:
          assistantChatSettings.includeWorkspaceInstructions,
        context_length: assistantChatSettings.contextLength,
        model: assistantChatSettings.model,
        image_path: assistant.image_path,
        prompt: assistantChatSettings.prompt,
        temperature: assistantChatSettings.temperature,
        sharing,
        conversation_starters: conversationStarters
      }}
      renderInputs={(renderState: {
        startingAssistantFiles: Tables<"files">[]
        setStartingAssistantFiles: React.Dispatch<
          React.SetStateAction<Tables<"files">[]>
        >
        selectedAssistantFiles: Tables<"files">[]
        setSelectedAssistantFiles: React.Dispatch<
          React.SetStateAction<Tables<"files">[]>
        >
        startingAssistantCollections: Tables<"collections">[]
        setStartingAssistantCollections: React.Dispatch<
          React.SetStateAction<Tables<"collections">[]>
        >
        selectedAssistantCollections: Tables<"collections">[]
        setSelectedAssistantCollections: React.Dispatch<
          React.SetStateAction<Tables<"collections">[]>
        >
        startingAssistantTools: Tables<"tools">[]
        setStartingAssistantTools: React.Dispatch<
          React.SetStateAction<Tables<"tools">[]>
        >
        selectedAssistantTools: Tables<"tools">[]
        setSelectedAssistantTools: React.Dispatch<
          React.SetStateAction<Tables<"tools">[]>
        >
      }) => (
        <>
          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="Assistant name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={ASSISTANT_NAME_MAX}
            />
          </div>

          <div className="space-y-1 pt-2">
            <Label>Description</Label>

            <TextareaAutosize
              className="bg-background border-input border"
              placeholder="Assistant description..."
              onValueChange={value => setDescription(value)}
              value={description}
              maxLength={ASSISTANT_DESCRIPTION_MAX}
              minRows={3}
              maxRows={6}
            />
          </div>

          <div className="space-y-1">
            <Label>Image</Label>

            <ImagePicker
              src={imageLink}
              image={selectedImage}
              onSrcChange={setImageLink}
              onImageChange={setSelectedImage}
              width={100}
              height={100}
            />
          </div>

          <ChatSettingsForm
            chatSettings={assistantChatSettings as any}
            onChangeChatSettings={setAssistantChatSettings}
            useAdvancedDropdown={true}
          />

          <div className="space-y-1 pt-2">
            <Label>Files & Collections</Label>

            <AssistantRetrievalSelect
              selectedAssistantRetrievalItems={[
                ...renderState.selectedAssistantFiles,
                ...renderState.selectedAssistantCollections
              ]}
              onAssistantRetrievalItemsSelect={item => {
                handleFileSelect(
                  item as Tables<"files">[],
                  renderState.setSelectedAssistantFiles
                )
              }}
            />
          </div>

          <div className="space-y-1">
            <Label>Plugins</Label>

            <AssistantToolSelect
              selectedAssistantTools={renderState.selectedAssistantTools}
              onAssistantToolsSelect={tools =>
                handleToolSelect(
                  tools as Tables<"tools">[],
                  renderState.setSelectedAssistantTools
                )
              }
            />
          </div>

          <AssistantConversationStarters
            value={conversationStarters}
            onChange={setConversationStarters}
          />

          <SharingField value={sharing} onChange={setSharing} />
        </>
      )}
    />
  )
}
