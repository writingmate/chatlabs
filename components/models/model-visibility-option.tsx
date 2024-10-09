import { LLM } from "@/types"
import { FC } from "react"
import { ModelIcon } from "./model-icon"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, WrenchIcon } from "lucide-react"

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
    <div className="flex w-full items-center justify-between space-x-3 rounded p-2">
      <div className="flex items-center space-x-3 truncate">
        <ModelIcon
          provider={model.provider}
          modelId={model.modelId}
          width={28}
          height={28}
        />
        <div className="flex items-center space-x-2">
          <span
            className={`text-sm ${selected ? "font-semibold" : "font-normal"}`}
          >
            {model.modelName}
          </span>
          <div className="flex items-center space-x-1">
            {model.tier && (
              <Badge variant="outline" className="relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 opacity-10"></span>
                <span className="relative bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  Pro
                </span>
              </Badge>
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
        </div>
      </div>
      <Switch checked={selected} onCheckedChange={onSelect} />
    </div>
  )
}
