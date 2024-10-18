import { IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { FC } from "react"
import {
  SIDEBAR_ICON_SIZE,
  SIDEBAR_ICON_STROKE
} from "../sidebar/sidebar-switcher"
import { Button } from "../ui/button"
import { DropdownMenuItem } from "../ui/dropdown-menu"
import { Switch } from "../ui/switch"
import { SIDEBAR_ITEM_ICON_SIZE } from "../sidebar/items/all/sidebar-display-item"

interface ThemeSwitcherProps {}

export const ThemeSwitcher: FC<ThemeSwitcherProps> = () => {
  const { setTheme, theme } = useTheme()

  const handleChange = (theme: "dark" | "light") => {
    try {
      localStorage.setItem("theme", theme)
    } catch (error) {
      console.error("Error setting theme:", error)
    }
    setTheme(theme)
  }

  return (
    <DropdownMenuItem
      className="flex cursor-pointer justify-between px-1"
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        handleChange(theme === "light" ? "dark" : "light")
      }}
    >
      <div className="flex items-center">
        {theme === "dark" ? (
          <IconMoon
            size={SIDEBAR_ITEM_ICON_SIZE}
            stroke={SIDEBAR_ICON_STROKE}
            className="text-muted-foreground mr-2"
          />
        ) : (
          <IconSun
            size={SIDEBAR_ITEM_ICON_SIZE}
            stroke={SIDEBAR_ICON_STROKE}
            className="text-muted-foreground mr-2"
          />
        )}
        <span className="text-sm">
          {theme === "dark" ? "Dark Mode" : "Light Mode"}
        </span>
      </div>
      <Switch checked={theme === "dark"} />
    </DropdownMenuItem>
  )
}
