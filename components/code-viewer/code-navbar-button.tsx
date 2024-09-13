import React, { forwardRef } from "react"
import { Button } from "@/components/ui/button"

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
      <Button
        ref={ref}
        disabled={disabled}
        title={title}
        className={`text-foreground size-4 hover:opacity-50 ${isActive ? "bg-accent text-white" : ""} ${className}`}
        onClick={onClick}
        variant="link"
        size="icon"
        {...props}
      >
        {icon}
      </Button>
    )
  }
)

NavbarButton.displayName = "NavbarButton"

export default NavbarButton
