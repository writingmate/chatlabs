"use client"

import { ChatbotUIContext } from "@/context/context"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { ChatSettings } from "@/types"
import { IconInfoCircle } from "@tabler/icons-react"
import { FC, useContext, useEffect, useState } from "react"
import { ModelSelect } from "../models/model-select"
import { AdvancedSettings } from "./advanced-settings"
import { Label } from "./label"
import { Slider } from "./slider"
import { TextareaAutosize } from "./textarea-autosize"
import { WithTooltip } from "./with-tooltip"
import { buildBasePrompt, DEFAULT_SYSTEM_PROMPT } from "@/lib/build-prompt"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

const TEMPERATURE_DESCRIPTION = `
Temperature affects the randomness of the AI model's responses. A higher temperature increases the randomness, while a lower temperature makes the responses more deterministic.
`

const CONTEXT_LENGTH_DESCRIPTION = `
The context length impacts the AI's grasp of chat history; longer contexts slow response but provide more history, while shorter ones increase speed and cut costs, as charges depend on the processed information volume..
`

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

  const { t } = useTranslation()
  if (!profile) return null

  const PromptSettings = (
    <div className="space-y-1">
      <Label>{t("Prompt")}</Label>

      <TextareaAutosize
        className="bg-background border-input border"
        placeholder={t("You are a helpful AI assistant.")}
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

interface InfoIconTooltipProps {
  label: string
}

export const InfoIconTooltip: FC<InfoIconTooltipProps> = ({ label }) => {
  return (
    <WithTooltip
      delayDuration={0}
      display={label}
      trigger={<IconInfoCircle className="cursor-hover:opacity-50" size={16} />}
    />
  )
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

  useEffect(() => {}, [])

  function findOpenRouterModel(modelId: string) {
    return availableOpenRouterModels.find(model => model.modelId === modelId)
  }

  const MODEL_LIMITS = CHAT_SETTING_LIMITS[chatSettings.model] || {
    MIN_TEMPERATURE: 0,
    MAX_TEMPERATURE: 1,
    MAX_CONTEXT_LENGTH:
      findOpenRouterModel(chatSettings.model)?.maxContext || 4096
  }

  const maxContextLength = isCustomModel
    ? models.find(model => model.model_id === chatSettings.model)
        ?.context_length
    : MODEL_LIMITS.MAX_CONTEXT_LENGTH

  const { t } = useTranslation()

  return (
    <div className="mt-2 w-full">
      <div className="space-y-1">
        <Label className="flex items-center justify-between space-x-1">
          <div className={"flex items-center space-x-2 text-nowrap"}>
            <div>{t("Temperature")}</div>
            <InfoIconTooltip label={t("TEMPERATURE_DESCRIPTION")} />
          </div>

          <Input
            className={
              "hover:border-input focus:border-input w-[140px] border-transparent text-right"
            }
            min={MODEL_LIMITS.MIN_TEMPERATURE}
            step={"any"}
            max={MODEL_LIMITS.MAX_TEMPERATURE}
            // type={"number"}
            onChange={e =>
              onChangeChatSettings({
                ...chatSettings,
                temperature: Math.max(
                  MODEL_LIMITS.MIN_TEMPERATURE,
                  Math.min(
                    parseFloat(e.target.value),
                    MODEL_LIMITS.MAX_TEMPERATURE!
                  )
                )
              })
            }
            value={chatSettings.temperature}
          />
        </Label>

        <Slider
          title={"Temperature"}
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
        <Label className="flex items-center justify-between space-x-1">
          <div className={"flex items-center space-x-2 text-nowrap"}>
            <div>{t("Context Length")}</div>
            <InfoIconTooltip label={t("CONTEXT_LENGTH_DESCRIPTION")} />
          </div>
          <Input
            className={
              "hover:border-input focus:border-input w-[140px] border-transparent text-right"
            }
            min={0}
            max={maxContextLength}
            step={1}
            pattern={"[0-9]*"}
            // type={"number"}
            onChange={e =>
              onChangeChatSettings({
                ...chatSettings,
                contextLength: Math.min(
                  parseInt(e.target.value),
                  maxContextLength!
                )
              })
            }
            value={chatSettings.contextLength}
          />
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
          max={maxContextLength}
          step={1}
        />
      </div>

      {/*<div className="mt-5">*/}
      {/*  <Label>Embeddings Provider</Label>*/}

      {/*  <Select*/}
      {/*    value={chatSettings.embeddingsProvider}*/}
      {/*    onValueChange={(embeddingsProvider: "openai" | "local") => {*/}
      {/*      onChangeChatSettings({*/}
      {/*        ...chatSettings,*/}
      {/*        embeddingsProvider*/}
      {/*      })*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <SelectTrigger>*/}
      {/*      <SelectValue defaultValue="openai"/>*/}
      {/*    </SelectTrigger>*/}

      {/*    <SelectContent>*/}
      {/*      <SelectItem value="openai">*/}
      {/*        {profile?.use_azure_openai ? "Azure OpenAI" : "OpenAI"}*/}
      {/*      </SelectItem>*/}

      {/*      {window.location.hostname === "localhost" && (*/}
      {/*        <SelectItem value="local">Local</SelectItem>*/}
      {/*      )}*/}
      {/*    </SelectContent>*/}
      {/*  </Select>*/}
      {/*</div>*/}
    </div>
  )
}
