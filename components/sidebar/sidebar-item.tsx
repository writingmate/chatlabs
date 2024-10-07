import { FC, ReactNode } from "react"
import { IconChevronRight } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { WithTooltip } from "../ui/with-tooltip"

interface SidebarItemProps {
  icon: ReactNode
  label: string
  onClick: () => void
  hasSubmenu?: boolean
  isCollapsed?: boolean
}

export const SidebarItem: FC<SidebarItemProps> = ({
  icon,
  label,
  onClick,
  hasSubmenu = false,
  isCollapsed = false
}) => {
  const buttonContent = (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "flex cursor-pointer items-center justify-start rounded-lg p-2 text-left text-sm font-normal",
        isCollapsed ? "w-10 justify-center" : "w-full"
      )}
      onClick={onClick}
    >
      <div className="flex shrink-0 items-center justify-center">{icon}</div>
      {!isCollapsed && (
        <>
          <span className="ml-3 grow truncate">{label}</span>
          {hasSubmenu && (
            <IconChevronRight className="text-muted-foreground size-4 shrink-0" />
          )}
        </>
      )}
    </Button>
  )

  if (isCollapsed) {
    return (
      <WithTooltip
        asChild
        display={<div>{label}</div>}
        trigger={buttonContent}
        side="right"
      />
    )
  }

  return buttonContent
}
