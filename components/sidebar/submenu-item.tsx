import { FC, ReactNode, useState } from "react"
import {
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconPin,
  IconPinnedOff
} from "@tabler/icons-react"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { cn } from "@/lib/utils"
import { SIDEBAR_ITEM_ICON_SIZE } from "@/components/sidebar/items/all/sidebar-display-item"

interface Action {
  icon: ReactNode
  label: string
  onClick: () => void
}

interface SubmenuItemProps {
  icon: ReactNode
  label: string
  onClick: () => void
  actions?: Action[]
  isPinned?: boolean
  isActive?: boolean
}

export const SubmenuItem: FC<SubmenuItemProps> = ({
  icon,
  label,
  onClick,
  actions = [],
  isPinned = false,
  isActive = false
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  return (
    <div
      className={cn(
        "hover:bg-accent focus:bg-accent hover:bg-accent group flex w-full cursor-pointer items-center rounded p-2 focus:outline-none",
        isActive && "bg-accent"
      )}
      onClick={onClick}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: SIDEBAR_ITEM_ICON_SIZE,
          height: SIDEBAR_ITEM_ICON_SIZE
        }}
      >
        {icon}
      </div>
      <div className="ml-3 flex-1 truncate text-sm">{label}</div>

      {actions.length > 0 && (
        <Popover open={isActionsOpen} onOpenChange={setIsActionsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-4 p-0",
                !isActive && "opacity-0 group-hover:opacity-100"
              )}
              onClick={e => {
                e.stopPropagation()
                setIsActionsOpen(true)
              }}
            >
              <IconDotsVertical className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-40 p-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={e => {
                    e.stopPropagation()
                    action.onClick()
                    setIsActionsOpen(false)
                  }}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
