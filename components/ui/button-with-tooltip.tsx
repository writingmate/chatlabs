import React, { FC } from "react"
import { Button, ButtonProps } from "./button"
import { WithTooltip } from "./with-tooltip"

interface ButtonWithTooltipProps extends ButtonProps {
  tooltip: string
}

export const ButtonWithTooltip: FC<ButtonWithTooltipProps> = ({
  tooltip,
  children,
  ...buttonProps
}) => {
  return (
    <WithTooltip
      display={<div>{tooltip}</div>}
      trigger={<Button {...buttonProps}>{children}</Button>}
    />
  )
}
