import { LLM, OpenRouterLLM } from "@/types"
import { FC } from "react"
import { ModelIcon } from "./model-icon"
import {
  IconBrain,
  IconCheck,
  IconCurrencyDollar,
  IconEye,
  IconHistory,
  IconPuzzle,
  IconTools
} from "@tabler/icons-react"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { PLAN_FREE } from "@/lib/stripe/config"
import { ImageIcon, WrenchIcon } from "lucide-react"

interface ModelOptionProps {
  model: LLM | OpenRouterLLM
  onSelect: () => void
  selected: boolean
  recent?: boolean
}

export const ModelOption: FC<ModelOptionProps> = ({
  model,
  selected,
  onSelect,
  recent
}) => {
  const { theme } = useTheme()

  let contextLength =
    CHAT_SETTING_LIMITS[model.modelId]?.MAX_CONTEXT_LENGTH || 0

  if ("maxContext" in model) {
    contextLength = model.maxContext
  }
  return (
    <div
      className="hover:bg-accent flex w-full cursor-pointer justify-start space-x-3 truncate rounded p-2 hover:opacity-50"
      onClick={onSelect}
    >
      <div className="flex w-full items-center justify-between space-x-2">
        <div className={"relative flex items-center space-x-2"}>
          {recent ? (
            <IconHistory
              className={cn(
                "rounded-sm bg-white p-1 text-black",
                theme === "dark" ? "bg-white" : "border-foreground/10 border"
              )}
              stroke={1.5}
              size={24}
            />
          ) : (
            <ModelIcon
              provider={model.provider}
              modelId={model.modelId}
              width={24}
              height={24}
            />
          )}
          <div
            className={
              "text-sm " + (selected ? "font-semibold" : "font-normal")
            }
          >
            {model.modelName}
          </div>
          {model.tier && model.tier !== "free" && (
            <Badge variant="outline" className="relative overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 opacity-10"></span>
              <span className="relative bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                {model.tier}
              </span>
            </Badge>
          )}
          {model.new && (
            <Badge className="h-5 bg-violet-700 text-xs">New</Badge>
          )}
          {model.imageInput && (
            <Badge
              variant="outline"
              className="flex size-5 items-center justify-center rounded-full p-0"
            >
              <ImageIcon className="size-3" />
            </Badge>
          )}
          {model.tools && (
            <Badge
              variant="outline"
              className="flex size-5 items-center justify-center rounded-full p-0"
            >
              <WrenchIcon className="size-3" />
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {selected && <IconCheck size={18} stroke={1.5} />}
        </div>
        {/*<div className={"flex items-center space-x-1"}>*/}
        {/*  {model.imageInput && (*/}
        {/*    <WithTooltip*/}
        {/*      side="top"*/}
        {/*      display={"Vision supported"}*/}
        {/*      trigger={*/}
        {/*        <div className="w-4 text-xs font-normal opacity-75">*/}
        {/*          <IconEye stroke={2} size={16} />*/}
        {/*        </div>*/}
        {/*      }*/}
        {/*    />*/}
        {/*  )}*/}
        {/*  {model.tools && (*/}
        {/*    <WithTooltip*/}
        {/*      side="top"*/}
        {/*      display={"Plugins supported"}*/}
        {/*      trigger={*/}
        {/*        <div className="w-4 text-xs font-normal opacity-75">*/}
        {/*          <IconPuzzle stroke={2} size={16} />*/}
        {/*        </div>*/}
        {/*      }*/}
        {/*    />*/}
        {/*  )}*/}
        {/*  {contextLength && (*/}
        {/*    <WithTooltip*/}
        {/*      side="top"*/}
        {/*      display={*/}
        {/*        "Context length: " + (contextLength / 1000).toFixed(0) + "k"*/}
        {/*      }*/}
        {/*      trigger={*/}
        {/*        <div className="flex w-12 text-xs font-normal opacity-75">*/}
        {/*          <IconBrain stroke={2} size={16} />*/}
        {/*          {(contextLength / 1000).toFixed(0)}k*/}
        {/*        </div>*/}
        {/*      }*/}
        {/*    />*/}
        {/*  )}*/}
        {/*</div>*/}
      </div>
    </div>
  )
}
