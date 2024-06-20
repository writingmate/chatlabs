import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Tables } from "@/supabase/types"

export function AssistantCategories({
  categories,
  selected
}: {
  categories: {
    name: string
    value: string
  }[]
  selected?: string
}) {
  return (
    <div className="flex space-x-2 py-4">
      {[...categories].map((cat, index: number) => (
        <Badge
          variant={cat.value === selected ? "default" : "outline"}
          key={index}
        >
          <Link href={"/assistants/" + cat.value}>{cat.name}</Link>
        </Badge>
      ))}
    </div>
  )
}
