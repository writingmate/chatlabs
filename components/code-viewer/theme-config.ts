import { UITheme } from "@/components/code-viewer/theme-configurator"

export const DEFAULT_THEME: UITheme = {
  colorScheme: "Default",
  font: "Inter",
  fontSize: 20,
  cornerRadius: 10,
  shadowSize: 0,
  colorPalette: ["#FFFFFF", "#CCCCCC", "#666666", "#000000"]
}

export const COLOR_SCHEMES = [
  { name: "Default", colors: ["#FFFFFF", "#CCCCCC", "#666666", "#000000"] },
  { name: "Ruby", colors: ["#FFFFFF", "#FFCCCC", "#FF6666", "#000000"] },
  { name: "Sapphire", colors: ["#FFFFFF", "#CCCCFF", "#6666FF", "#000000"] },
  { name: "Emerald", colors: ["#FFFFFF", "#CCFFCC", "#66FF66", "#000000"] },
  { name: "Windows 98", colors: ["#0000FF", "#C0C0C0", "#808080", "#000000"] },
  { name: "Daylight", colors: ["#FFD700", "#FFA500", "#8B4513", "#000000"] },
  { name: "Midnight", colors: ["#000000", "#333333", "#666666", "#999999"] },
  { name: "Pastel", colors: ["#FFB6C1", "#FF69B4", "#9370DB", "#000000"] }
]

export const FONT_FAMILIES = [
  "Arial",
  "Verdana",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Palatino",
  "Garamond",
  "Bookman",
  "Comic Sans MS",
  "Trebuchet MS",
  "Arial Black",
  "Impact",
  "Lucida Sans",
  "Tahoma",
  "Geneva",
  "Helvetica",
  "Calibri",
  "Candara",
  "Optima",
  "Segoe UI",
  "Futura",
  "Baskerville",
  "Century Gothic",
  "Franklin Gothic Medium"
]
