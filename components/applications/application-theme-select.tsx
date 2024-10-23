import { forwardRef, useEffect, useRef, useState } from "react"
import { Tables } from "@/supabase/types"
import { SelectItem } from "@radix-ui/react-select"
// @ts-ignore
import functions from "daisyui/src/theming/functions"
import daisyuiThemes from "daisyui/src/theming/themes"

import { cn } from "@/lib/utils"

import { Select, SelectContent, SelectTrigger, SelectValue } from "../ui/select"

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

export function ApplicationThemeSelect({
  application,
  handleChange
}: {
  application: Tables<"applications">
  handleChange: (key: string, value: string) => void
}) {
  return (
    <Select
      value={application.theme || "light"}
      onValueChange={value => handleChange("theme", value)}
    >
      <SelectTrigger className="capitalize">
        <SelectValue placeholder="Select theme">
          {application.theme || "light"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="cu m-0 flex cursor-pointer overflow-hidden rounded-md p-0">
        {themes.map(t => {
          const theme = functions.convertColorFormat(daisyuiThemes[t])
          const background = theme["--b1"]
          const textColor = theme["--bc"]
          const fontFamily = theme["fontFamily"]
          return (
            <SelectItem
              key={t}
              value={t}
              className="border-b-input flex w-full items-center justify-between border-b text-sm capitalize last:border-b-0"
              style={{
                // @ts-ignore
                colorScheme: daisyuiThemes[t]["color-scheme"],
                // @ts-ignore
                fontFamily: fontFamily,
                // @ts-ignore
                backgroundColor: `oklch(${background})`,
                color: `oklch(${textColor})`
                // @ts-ignore
              }}
            >
              <span className="flex px-2">{t}</span>
              <span className="flex items-center">
                {["p", "s", "a", "n"].map(color => {
                  const background = theme[`--${color}`]
                  const content = theme[`--${color}c`]
                  return (
                    <span
                      key={color}
                      className={cn("flex size-8 items-center justify-center")}
                      style={{
                        color: `oklch(${content})`,
                        backgroundColor: `oklch(${background})`
                      }}
                    >
                      <span className="font-semibold">A</span>
                    </span>
                  )
                })}
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
