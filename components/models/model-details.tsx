import { LLM } from "@/types"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { ModelIcon } from "@/components/models/model-icon"
import { IconCheck, IconX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

export function ModelDetails({
  className,
  model
}: {
  className?: string
  model: LLM
}) {
  let contextLength =
    CHAT_SETTING_LIMITS[model.modelId]?.MAX_CONTEXT_LENGTH || 0

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
      <div className={"flex grow"}>
        <div className={"w-2/5 py-2 font-semibold"}>{label}</div>
        <div className={"py-2"}>{value}</div>
      </div>
    )
  }

  return (
    <div className={cn("flex w-[320px] flex-col", className)}>
      <div className={"flex items-center space-x-2"}>
        <ModelIcon
          provider={model?.provider}
          modelId={model?.modelId}
          width={26}
          height={26}
        />
        <span className={"capitalize"}>{model.provider}</span>
        <span>/</span>
        <span className={"font-semibold"}>{model.modelName}</span>
      </div>
      <div className="grid grid-cols-1 divide-y pt-4 text-xs">
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
          label={"Supports plugins"}
          value={
            model.tools ? (
              <IconCheck size={18} stroke={1.5} />
            ) : (
              <IconX size={18} stroke={1.5} />
            )
          }
        />
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
      </div>
    </div>
  )
}
