import { UITheme } from "@/components/theme/theme-configurator"

export const DEFAULT_THEME: UITheme = {
  colorScheme: "Sunset Glow",
  font: "Inter",
  fontSize: 20,
  cornerRadius: 10,
  shadowSize: 0,
  colorPalette: ["#FF5E5B", "#D8A47F", "#FFED66", "#6A0572", "#177E89"]
}

export const COLOR_SCHEMES = [
  {
    name: "Sunset Glow",
    colors: ["#FF5E5B", "#D8A47F", "#FFED66", "#6A0572", "#177E89"]
  },
  {
    name: "Ocean Breeze",
    colors: ["#00A8E8", "#007EA7", "#003459", "#00171F", "#A2AEBB"]
  },
  {
    name: "Forest Whisper",
    colors: ["#2E8B57", "#3CB371", "#556B2F", "#6B8E23", "#8FBC8F"]
  },
  {
    name: "Autumn Harvest",
    colors: ["#D2691E", "#FF7F50", "#FF4500", "#CD853F", "#8B4513"]
  },
  {
    name: "Candy Land",
    colors: ["#FF6F61", "#FFB6C1", "#FFD700", "#FF69B4", "#FF1493"]
  },
  {
    name: "Mystic Twilight",
    colors: ["#483D8B", "#6A5ACD", "#7B68EE", "#9370DB", "#8A2BE2"]
  },
  {
    name: "Spring Blossom",
    colors: ["#FFB6C1", "#FF69B4", "#FF1493", "#DB7093", "#C71585"]
  },
  {
    name: "Desert Mirage",
    colors: ["#C19A6B", "#D2B48C", "#DEB887", "#F4A460", "#DAA520"]
  },
  {
    name: "Iceberg Chill",
    colors: ["#E0FFFF", "#AFEEEE", "#7FFFD4", "#40E0D0", "#48D1CC"]
  },
  {
    name: "Vintage Vibe",
    colors: ["#D8BFD8", "#DDA0DD", "#EE82EE", "#DA70D6", "#BA55D3"]
  }
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
