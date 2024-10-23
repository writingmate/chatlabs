import { FC } from "react"
import { LLM } from "@/types"
import { useTheme } from "next-themes"

import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

import { ModelIcon } from "./model-icon"

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
    <div
      onClick={e => {
        onSelect(!selected)
      }}
      className="hover:bg-accent flex w-full cursor-pointer justify-start space-x-3 truncate rounded p-2"
    >
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
        <Switch checked={selected} />
      </div>
    </div>
  )
}
