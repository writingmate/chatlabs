import { FC, useRef, useEffect, useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { IconPalette } from "@tabler/icons-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { COLOR_SCHEMES, DEFAULT_THEME, FONT_FAMILIES } from "@/lib/config"

export interface UITheme {
  colorScheme: string
  font: string
  fontSize: number
  cornerRadius: number
  shadowSize: number
  colorPalette: string[]
}

interface ThemeConfiguratorProps {
  theme?: UITheme
  disabled?: boolean
  onThemeChange: (theme: UITheme) => void
}

export const ThemeConfigurator: FC<ThemeConfiguratorProps> = ({
  theme = DEFAULT_THEME,
  disabled = false,
  onThemeChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [themeState, setTheme] = useState(theme)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        triggerRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleApplyTheme = () => {
    onThemeChange({
      ...themeState,
      colorPalette:
        COLOR_SCHEMES.find(x => x.name === themeState.colorScheme)?.colors || []
    })
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={isOpen => setIsOpen(isOpen)}>
      <DropdownMenuTrigger
        disabled={disabled}
        className="flex size-6 items-center justify-center border-0 text-white"
      >
        <div>
          <IconPalette size={18} stroke={1.5} />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[300px] space-y-2 overflow-auto rounded-md p-3"
        align="start"
      >
        <div>
          <Label htmlFor="colorScheme">Color Palette</Label>
          <Select
            value={themeState.colorScheme}
            onValueChange={e => setTheme({ ...theme, colorScheme: e })}
          >
            <SelectTrigger>
              <SelectValue>{themeState.colorScheme}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {COLOR_SCHEMES.map(palette => (
                <SelectItem
                  key={palette.name}
                  value={palette.name}
                  className={"w-full"}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="mr-2">{palette.name}</div>
                    <div className="flex">
                      {palette.colors.map((color, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: color,
                            width: 12,
                            height: 12,
                            display: "inline-block",
                            marginLeft: 2,
                            borderRadius: "50%"
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Font</Label>
          <Select
            value={themeState.font}
            onValueChange={e => setTheme({ ...theme, font: e })}
          >
            <SelectTrigger>
              <SelectValue
                style={{
                  fontFamily: themeState.font
                }}
              >
                {themeState.font}
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

        <div>
          <Label htmlFor="fontSize">Font Size</Label>
          <Input
            type="number"
            id="fontSize"
            value={themeState.fontSize}
            onChange={e =>
              setTheme({ ...theme, fontSize: Number(e.target.value) })
            }
            min={10}
            max={30}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="cornerRadius">Corner Radius</Label>
          <Input
            type="number"
            id="cornerRadius"
            value={themeState.cornerRadius}
            onChange={e =>
              setTheme({ ...themeState, cornerRadius: Number(e.target.value) })
            }
            min={0}
            max={50}
            className="w-full"
          />
        </div>
        <div>
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
        </div>

        <Button size={"sm"} onClick={handleApplyTheme} className="w-full">
          Apply
        </Button>
        <Separator className={"opacity-75"} />
        <div className={"text-foreground/60 text-xs"}>
          Note: the AI will use the theme as a guidance to preferred visual
          style.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
