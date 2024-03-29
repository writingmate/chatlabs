"use client"

import { ChatbotUIContext } from "@/context/context"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { ChatSettings } from "@/types"
import { IconInfoCircle } from "@tabler/icons-react"
import { FC, useContext } from "react"
import { ModelSelect } from "../models/model-select"
import { AdvancedSettings } from "./advanced-settings"
import { Checkbox } from "./checkbox"
import { Label } from "./label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./select"
import { Slider } from "./slider"
import { TextareaAutosize } from "./textarea-autosize"
import { WithTooltip } from "./with-tooltip"
import { buildBasePrompt } from "@/lib/build-prompt"

interface ChatSettingsFormProps {
  chatSettings: ChatSettings
  onChangeChatSettings: (value: ChatSettings) => void
  useAdvancedDropdown?: boolean
  showTooltip?: boolean
}

export const ChatSettingsForm: FC<ChatSettingsFormProps> = ({
  chatSettings,
  onChangeChatSettings,
  useAdvancedDropdown = true,
  showTooltip = true
}) => {
  const { profile, models } = useContext(ChatbotUIContext)

  if (!profile) return null

  const PromptSettings = (
    <div className="space-y-1">
      <Label>Prompt</Label>

      <TextareaAutosize
        className="bg-background border-input border"
        placeholder="You are a helpful AI assistant."
        onValueChange={prompt => {
          onChangeChatSettings({ ...chatSettings, prompt })
        }}
        value={chatSettings.prompt}
        minRows={3}
        maxRows={6}
      />
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Model</Label>

        <ModelSelect
          selectedModelId={chatSettings.model}
          onSelectModel={model => {
            onChangeChatSettings({ ...chatSettings, model })
          }}
        />
      </div>

      {PromptSettings}

      {useAdvancedDropdown ? (
        <AdvancedSettings>
          <AdvancedContent
            chatSettings={chatSettings}
            onChangeChatSettings={onChangeChatSettings}
            showTooltip={showTooltip}
          />
        </AdvancedSettings>
      ) : (
        <div>
          {PromptSettings}
          <AdvancedContent
            chatSettings={chatSettings}
            onChangeChatSettings={onChangeChatSettings}
            showTooltip={showTooltip}
          />
        </div>
      )}
    </div>
  )
}

interface AdvancedContentProps {
  chatSettings: ChatSettings
  onChangeChatSettings: (value: ChatSettings) => void
  showTooltip: boolean
  showOverrideSystemPrompt?: boolean
}

export const AdvancedContent: FC<AdvancedContentProps> = ({
  chatSettings,
  onChangeChatSettings,
  showTooltip,
  showOverrideSystemPrompt = false
}) => {
  const {
    profile,
    selectedAssistant,
    selectedWorkspace,
    availableOpenRouterModels,
    models
  } = useContext(ChatbotUIContext)

  const isCustomModel = models.some(
    model => model.model_id === chatSettings.model
  )

  function findOpenRouterModel(modelId: string) {
    return availableOpenRouterModels.find(model => model.modelId === modelId)
  }

  const MODEL_LIMITS = CHAT_SETTING_LIMITS[chatSettings.model] || {
    MIN_TEMPERATURE: 0,
    MAX_TEMPERATURE: 1,
    MAX_CONTEXT_LENGTH:
      findOpenRouterModel(chatSettings.model)?.maxContext || 4096
  }

  const SYSTEM_PROMPT = buildBasePrompt(
    chatSettings.prompt || "",
    profile?.profile_context || "",
    selectedWorkspace?.instructions || "",
    selectedAssistant
  )

  return (
    <div className="mt-5">
      <div className="space-y-3">
        <Label className="flex items-center space-x-1">
          <div>Temperature:</div>

          <div>{chatSettings.temperature}</div>
        </Label>

        <Slider
          value={[chatSettings.temperature]}
          onValueChange={temperature => {
            onChangeChatSettings({
              ...chatSettings,
              temperature: temperature[0]
            })
          }}
          min={MODEL_LIMITS.MIN_TEMPERATURE}
          max={MODEL_LIMITS.MAX_TEMPERATURE}
          step={0.01}
        />
      </div>

      <div className="mt-6 space-y-3">
        <Label className="flex items-center space-x-1">
          <div>Context Length:</div>

          <div>{chatSettings.contextLength}</div>
        </Label>

        <Slider
          value={[chatSettings.contextLength]}
          onValueChange={contextLength => {
            onChangeChatSettings({
              ...chatSettings,
              contextLength: contextLength[0]
            })
          }}
          min={0}
          max={
            isCustomModel
              ? models.find(model => model.model_id === chatSettings.model)
                  ?.context_length
              : MODEL_LIMITS.MAX_CONTEXT_LENGTH
          }
          step={1}
        />
      </div>

      {showOverrideSystemPrompt && (
        <>
          <div className="mt-7 flex items-center space-x-2">
            <Checkbox
              checked={!!chatSettings.useCustomSystemPrompt}
              onCheckedChange={(value: boolean) =>
                onChangeChatSettings({
                  ...chatSettings,
                  customSystemPrompt: SYSTEM_PROMPT,
                  useCustomSystemPrompt: value
                })
              }
            />

            <Label>Override System Prompt</Label>

            {showTooltip && (
              <WithTooltip
                delayDuration={0}
                display={<div className="w-[400px] p-3">{SYSTEM_PROMPT}</div>}
                trigger={
                  <IconInfoCircle
                    className="cursor-hover:opacity-50"
                    size={16}
                  />
                }
              />
            )}
          </div>

          {chatSettings.useCustomSystemPrompt && (
            <TextareaAutosize
              minRows={5}
              className="mt-2"
              value={chatSettings.customSystemPrompt || ""}
              onValueChange={value => {
                onChangeChatSettings({
                  ...chatSettings,
                  customSystemPrompt: value
                })
              }}
            />
          )}
        </>
      )}

      <div className="mt-5">
        <Label>Embeddings Provider</Label>

        <Select
          value={chatSettings.embeddingsProvider}
          onValueChange={(embeddingsProvider: "openai" | "local") => {
            onChangeChatSettings({
              ...chatSettings,
              embeddingsProvider
            })
          }}
        >
          <SelectTrigger>
            <SelectValue defaultValue="openai" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="openai">
              {profile?.use_azure_openai ? "Azure OpenAI" : "OpenAI"}
            </SelectItem>

            {window.location.hostname === "localhost" && (
              <SelectItem value="local">Local</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
