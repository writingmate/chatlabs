import { FC, useState } from "react"
import {
  IconUser,
  IconSettings,
  IconLogout,
  IconChevronUp
} from "@tabler/icons-react"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

interface UserSettingsProps {
  isCollapsed: boolean
  onLogout: () => void
  onOpenSettings: () => void
}

export const UserSettings: FC<UserSettingsProps> = ({
  isCollapsed,
  onLogout,
  onOpenSettings
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-t">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start rounded-lg px-3 py-2 text-sm`}
          >
            <IconUser size={18} className="shrink-0" />
            {!isCollapsed && (
              <span className="ml-3 grow truncate text-left">User</span>
            )}
            {!isCollapsed && (
              <IconChevronUp
                size={18}
                stroke={1.5}
                className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="end" alignOffset={-8}>
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={onOpenSettings}
            >
              <IconSettings size={18} className="mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={onLogout}
            >
              <IconLogout size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
