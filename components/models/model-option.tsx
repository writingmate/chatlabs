import { LLM } from "@/types"
import { FC } from "react"
import { ModelIcon } from "./model-icon"
import {
  IconBrain,
  IconCurrencyDollar,
  IconEye,
  IconPuzzle,
  IconTools
} from "@tabler/icons-react"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { WithTooltip } from "@/components/ui/with-tooltip"

interface ModelOptionProps {
  model: LLM
  onSelect: () => void
}

export const ModelOption: FC<ModelOptionProps> = ({ model, onSelect }) => {
  return (
    <div
      className="hover:bg-accent flex w-full cursor-pointer justify-start space-x-3 truncate rounded p-2 hover:opacity-50"
      onClick={onSelect}
    >
      <div className="flex w-full items-center justify-between space-x-2">
        <div className={"flex items-center space-x-2"}>
          <ModelIcon provider={model.provider} width={28} height={28} />
          <div className="text-sm font-semibold">{model.modelName}</div>
        </div>
        <div className={"flex items-center space-x-1"}>
          {model.paid && (
            <WithTooltip
              side="top"
              display={"Subscription required"}
              trigger={
                <div className="w-4 text-xs font-normal opacity-75">
                  <IconCurrencyDollar stroke={2} size={16} />
                </div>
              }
            />
          )}
          {model.imageInput && (
            <WithTooltip
              side="top"
              display={"Vision supported"}
              trigger={
                <div className="w-4 text-xs font-normal opacity-75">
                  <IconEye stroke={2} size={16} />
                </div>
              }
            />
          )}
          {model.tools && (
            <WithTooltip
              side="top"
              display={"Tools supported"}
              trigger={
                <div className="w-4 text-xs font-normal opacity-75">
                  <IconPuzzle stroke={2} size={16} />
                </div>
              }
            />
          )}
          <WithTooltip
            side="top"
            display={
              "Context length: " +
              (
                CHAT_SETTING_LIMITS[model.modelId].MAX_CONTEXT_LENGTH / 1000
              ).toFixed(0) +
              "k"
            }
            trigger={
              <div className="flex w-12 text-xs font-normal opacity-75">
                <IconBrain stroke={2} size={16} />
                {(
                  CHAT_SETTING_LIMITS[model.modelId].MAX_CONTEXT_LENGTH / 1000
                ).toFixed(0)}
                k
              </div>
            }
          />
        </div>
      </div>
    </div>
  )
}
