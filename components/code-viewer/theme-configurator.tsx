import { FC, useEffect, useRef, useState } from "react"
import { IconPalette } from "@tabler/icons-react"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import NavbarButton from "@/components/code-viewer/code-navbar-button"
import {
  DEFAULT_THEME,
  FONT_FAMILIES,
  THEMES
} from "@/components/code-viewer/theme-config"

import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"

export interface UITheme {
  "color-scheme": string
  primary: string
  secondary: string
  accent: string
  neutral: string
  "base-100": string
  "primary-content"?: string
  "secondary-content"?: string
  "accent-content"?: string
  "neutral-content"?: string
  "base-200"?: string
  "base-300"?: string
  fontFamily?: string
  fontSize?: string
  info?: string
  success?: string
  warning?: string
  error?: string
  "info-content"?: string
  "success-content"?: string
  "warning-content"?: string
  "error-content"?: string
  "base-content"?: string
  "--rounded-box"?: string
  "--rounded-btn"?: string
  "--rounded-badge"?: string
  "--tab-border"?: string
  "--tab-radius"?: string
  "--animation-btn"?: string
  "--animation-input"?: string
  "--btn-focus-scale"?: string
}

interface ThemeConfiguratorProps {
  theme: { name: string; theme: UITheme }
  disabled?: boolean
  onThemeChange: (theme: { name: string; theme: UITheme }) => void
}

export const ThemeConfigurator: FC<ThemeConfiguratorProps> = ({
  theme: themeState,
  disabled = false,
  onThemeChange: setTheme
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        triggerRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor="colorScheme">Color Palette</Label>
        <Select
          value={themeState.name}
          onValueChange={e => setTheme(THEMES.find(x => x.name === e)!)}
        >
          <SelectTrigger>
            <SelectValue>
              <PaletteItem name={themeState.name} theme={themeState.theme} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {THEMES.map(({ name, theme }) => (
              <SelectItem key={name} value={name} className={"block w-full"}>
                <PaletteItem name={name} theme={theme} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Font</Label>
        <Select
          value={themeState.theme?.fontFamily || "sans-serif"}
          onValueChange={e =>
            setTheme({
              ...themeState,
              theme: { ...themeState.theme, fontFamily: e }
            })
          }
        >
          <SelectTrigger>
            <SelectValue
              style={{
                fontFamily: themeState.theme?.fontFamily || "sans-serif"
              }}
            >
              {themeState.theme?.fontFamily?.split(",")[0] || "sans-serif"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map(font => (
              <SelectItem
                style={{
                  fontFamily: font
                }}
                key={font}
                value={font}
              >
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="fontSize">Font Size</Label>
        <Input
          type="number"
          id="fontSize"
          value={parseFloat(themeState.theme?.fontSize || "16")}
          onChange={e =>
            setTheme({
              ...themeState,
              theme: {
                ...themeState.theme,
                fontSize: Number(e.target.value) + "px"
              }
            })
          }
          min={10}
          max={30}
          className="w-full"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="cornerRadius">Corner Radius</Label>
        <Input
          type="number"
          id="cornerRadius"
          value={parseFloat(themeState.theme?.["--rounded-box"] || "8")}
          onChange={e =>
            setTheme({
              ...themeState,
              theme: {
                ...themeState.theme,
                "--rounded-btn": Number(e.target.value) + "px",
                "--rounded-badge": Number(e.target.value) + "px",
                "--rounded-box": Number(e.target.value) + "px"
              }
            })
          }
          min={0}
          max={50}
          className="w-full"
        />
      </div>
      {/* <div>
        <Label htmlFor="shadowSize">Shadow Size</Label>
        <Input
          type="number"
          id="shadowSize"
          value={themeState.shadowSize}
          onChange={e =>
            setTheme({ ...themeState, shadowSize: Number(e.target.value) })
          }
          min={0}
          max={50}
          className="w-full"
        />
      </div> */}

      {/* <Separator className={"opacity-75"} />
      <div className={"text-foreground/60 text-xs"}>
        Note: the AI will use the theme as a guidance to preferred visual
        style.
      </div> */}
    </div>
  )
}

function PaletteItem({ name, theme }: { name: string; theme: UITheme }) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="mr-2 capitalize">{name}</div>
      <div className="border-input flex overflow-hidden rounded-full border">
        {[
          theme.primary,
          theme.secondary,
          theme.accent,
          theme.neutral,
          theme["base-100"]
        ].map((color, index) => (
          <span
            key={index}
            style={{
              backgroundColor: color,
              width: 14,
              height: 14,
              display: "inline-block"
            }}
          />
        ))}
      </div>
    </div>
  )
}
