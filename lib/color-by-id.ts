const COLOR_CLASSES = [
  "bg-red-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-purple-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-orange-500"
]

// consistent number based on the assistant id (string) of a given range
export function getColorById(id: string) {
  console.log(id)
  return COLOR_CLASSES[
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      COLOR_CLASSES.length
  ]
}
