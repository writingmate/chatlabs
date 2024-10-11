import { LLM } from "@/types"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { ModelIcon } from "@/components/models/model-icon"
import { IconCheck, IconX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { Badge } from "@/components/ui/badge"
import { CATEGORIES } from "@/lib/models/categories"
import Markdown from "react-markdown"
import { WithTooltip } from "../ui/with-tooltip"
import { useTranslation } from "react-i18next"

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

  const { t } = useTranslation()

  return (
    <div className={cn("flex w-[320px] flex-col space-y-2", className)}>
      <div className={"flex items-center space-x-2"}>
        <ModelIcon
          provider={model?.provider}
          modelId={model?.modelId}
          width={26}
          height={26}
        />
        {model.provider !== "openrouter" && (
          <>
            <span className={"capitalize"}>{model.provider}</span>
            <span>/</span>
          </>
        )}
        <span className={"font-semibold"}>{model.modelName}</span>
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
        <Row label={t("Context")} value={formattedContextLength + " tokens"} />
        {model.pricing && (
          <>
            <Row
              label={t("Input pricing")}
              value={"$" + inputCost + " / million tokens"}
            />
            <Row
              label={t("Output pricing")}
              value={"$" + outputCost + " / million tokens"}
            />
          </>
        )}
        <Row
          label={t("Supports vision")}
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
            label={t("Supports plugins")}
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
            label={t("Plugins selected")}
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
