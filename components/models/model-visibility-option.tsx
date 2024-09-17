import { LLM } from "@/types"
import { FC } from "react"
import { ModelIcon } from "./model-icon"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface ModelVisibilityOption {
  model: LLM
  onSelect: (checked: boolean) => void
  selected: boolean
}

export const ModelVisibilityOption: FC<ModelVisibilityOption> = ({
  model,
  selected,
  onSelect
}) => {
  const { theme } = useTheme()

  return (
    <div className="flex w-full justify-start space-x-3 truncate rounded p-2">
      <div className="flex w-full items-center justify-between space-x-2">
        <div className={"relative flex items-center space-x-2"}>
          <ModelIcon
            provider={model.provider}
            modelId={model.modelId}
            width={28}
            height={28}
          />
          <div
            className={"text-sm" + (selected ? "font-semibold" : "font-normal")}
          >
            {model.modelName}
            {model.tier !== "free" && model.tier !== undefined && (
              <Badge variant={"outline"} className="ml-2 capitalize">
                {model.tier}
              </Badge>
            )}
          </div>
        </div>
        <Switch checked={selected} onCheckedChange={onSelect} />
      </div>
    </div>
  )
}
