import { Tables } from "@/supabase/types"

import { Select, SelectContent, SelectTrigger, SelectValue } from "../ui/select"
import { SelectItem } from "@radix-ui/react-select"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import daisyuiThemes from "daisyui/src/theming/themes"

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset"
] as const

function ThemeSelectItem({ theme }: { theme: string }) {
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener("load", () => setLoaded(true))
    }
  }, [ref])
  return (
    <SelectItem
      value={theme}
      className="flex w-full items-center justify-between p-0.5 text-sm capitalize"
    >
      <div
        className="flex w-full items-center justify-between"
        style={{
          // @ts-ignore
          fontFamily: daisyuiThemes[theme]["font-sans"]
        }}
      >
        <div>{theme}</div>
        <div className="flex items-center gap-1">
          {["bg-primary", "bg-secondary", "bg-accent", "bg-neutral"].map(
            color => (
              <div
                key={color}
                className={cn("size-7 rounded-full")}
                // @ts-ignore
                style={{ backgroundColor: daisyuiThemes[theme][color] }}
              ></div>
            )
          )}
        </div>
      </div>
    </SelectItem>
  )
}

export function ApplicationThemeSelect({
  application,
  handleChange
}: {
  application: Tables<"applications">
  handleChange: (key: string, value: string) => void
}) {
  const [iframesLoaded, setIframesLoaded] = useState<Record<string, boolean>>(
    {}
  )

  const handleIframeLoad = (theme: string) => {
    console.log("iframe loaded", theme)
    setIframesLoaded(prev => ({ ...prev, [theme]: true }))
  }

  return (
    <Select
      value={application.theme || "light"}
      onValueChange={value => handleChange("theme", value)}
    >
      <SelectTrigger className="capitalize">
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent className="w-full">
        {themes.map(t => (
          <ThemeSelectItem key={t} theme={t} />
        ))}
      </SelectContent>
    </Select>
  )
}
