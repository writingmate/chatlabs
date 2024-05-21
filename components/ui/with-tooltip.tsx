import { FC } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./tooltip"

interface WithTooltipProps {
  display: React.ReactNode
  trigger: React.ReactNode
  asChild?: boolean
  delayDuration?: number
  side?: "left" | "right" | "top" | "bottom"
}

export const WithTooltip: FC<WithTooltipProps> = ({
  display,
  trigger,
  asChild = false,
  delayDuration = 500,
  side = "right"
}) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild={asChild}>{trigger}</TooltipTrigger>

        <TooltipContent side={side}>{display}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
