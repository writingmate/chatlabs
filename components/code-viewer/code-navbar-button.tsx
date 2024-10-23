import React, { forwardRef } from "react"

import { Button } from "@/components/ui/button"

import { ButtonWithTooltip } from "../ui/button-with-tooltip"

interface NavbarButtonProps {
  icon: React.ReactNode
  title: string
  onClick?: () => void
  disabled?: boolean
  className?: string
  isActive?: boolean
}

const NavbarButton = forwardRef<HTMLButtonElement, NavbarButtonProps>(
  ({ icon, title, onClick, disabled, className, isActive, ...props }, ref) => {
    return (
      <ButtonWithTooltip
        ref={ref}
        tooltip={title}
        disabled={disabled}
        className={`text-foreground size-4 hover:opacity-50 ${isActive ? "bg-accent text-white" : ""} ${className}`}
        onClick={onClick}
        variant="link"
        size="icon"
        {...props}
      >
        {icon}
      </ButtonWithTooltip>
    )
  }
)

NavbarButton.displayName = "NavbarButton"

export default NavbarButton
