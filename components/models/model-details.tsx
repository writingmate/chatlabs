import { Tables } from "@/supabase/types"
import { LLM } from "@/types"
import { IconCheck, IconX } from "@tabler/icons-react"
import Markdown from "react-markdown"

import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { CATEGORIES } from "@/lib/models/categories"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ModelIcon } from "@/components/models/model-icon"

import { WithTooltip } from "../ui/with-tooltip"

export function ModelDetails({
  className,
  model,
  selectedTools
}: {
  className?: string
  model: LLM
  selectedTools?: Tables<"tools">[]
}) {
  let contextLength =
    CHAT_SETTING_LIMITS[model?.modelId]?.MAX_CONTEXT_LENGTH || 0

  if ("maxContext" in model) {
    contextLength = model.maxContext as number
  }

  const formattedContextLength = contextLength.toLocaleString()
  const inputCost = model.pricing?.inputCost?.toLocaleString()
  const outputCost = model.pricing?.outputCost?.toLocaleString()

  function Row({
    label,
    value
  }: {
    label: string
    value: string | JSX.Element
  }) {
    return (
      <div className={"flex h-[36px] grow items-center"}>
        <div className={"w-2/5 py-2 font-semibold"}>{label}</div>
        <div className={"w-3/5 overflow-hidden py-2"}>{value}</div>
      </div>
    )
  }

  return (
    <div className={cn("flex w-[320px] flex-col space-y-2", className)}>
      <div className="flex items-center space-x-2 overflow-hidden whitespace-nowrap">
        <ModelIcon
          provider={model?.provider}
          modelId={model?.modelId}
          width={26}
          height={26}
        />
        <span className="capitalize">{model.provider}</span>
        <span>/</span>
        <span className="truncate font-semibold">{model.modelName}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {model.categories?.map(category => (
          <WithTooltip
            side="top"
            key={category.category}
            display={category.description}
            trigger={
              <Badge
                variant="outline"
                className={`text-nowrap py-0.5`}
                key={category.category}
              >
                {category.category}
              </Badge>
            }
          />
        ))}
        {model.description && (
          <Markdown className="text-muted-foreground line-clamp-6 text-xs hover:line-clamp-none">
            {model.description}
          </Markdown>
        )}
      </div>
      <div className="grid grid-cols-1 divide-y text-xs">
        <Row label={"Context"} value={formattedContextLength + " tokens"} />
        {model.pricing && (
          <>
            <Row
              label={"Input pricing"}
              value={"$" + inputCost + " / million tokens"}
            />
            <Row
              label={"Output pricing"}
              value={"$" + outputCost + " / million tokens"}
            />
          </>
        )}
        <Row
          label={"Supports vision"}
          value={
            model.imageInput ? (
              <IconCheck size={18} stroke={1.5} />
            ) : (
              <IconX size={18} stroke={1.5} />
            )
          }
        />
        {!model.tools || !selectedTools || selectedTools?.length === 0 ? (
          <Row
            label={"Supports plugins"}
            value={
              model.tools ? (
                <IconCheck size={18} stroke={1.5} />
              ) : (
                <IconX size={18} stroke={1.5} />
              )
            }
          />
        ) : (
          <Row
            label={"Plugins selected"}
            value={
              <div
                className={
                  "flex w-[200px] flex-nowrap space-x-1 overflow-hidden"
                }
              >
                {selectedTools.map(tool => (
                  <Badge className={"text-nowrap py-0.5"} key={tool.id}>
                    {tool.name}
                  </Badge>
                ))}
              </div>
            }
          />
        )}
      </div>
    </div>
  )
}
