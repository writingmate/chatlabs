import React, { forwardRef } from "react"

import { Button, ButtonProps } from "./button"
import { WithTooltip } from "./with-tooltip"

interface ButtonWithTooltipProps extends ButtonProps {
  tooltip: string
  tooltipSide?: "left" | "right" | "top" | "bottom"
}

export const ButtonWithTooltip = forwardRef<
  HTMLButtonElement,
  ButtonWithTooltipProps
>(({ tooltip, children, tooltipSide = "top", ...buttonProps }, ref) => {
  return (
    <WithTooltip
      side={tooltipSide}
      asChild={true}
      display={<div>{tooltip}</div>}
      trigger={
        <Button ref={ref} {...buttonProps}>
          {children}
        </Button>
      }
    />
  )
})

ButtonWithTooltip.displayName = "ButtonWithTooltip"
