import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Tables } from "@/supabase/types"

export function PromptCategories({
  categories,
  selected
}: {
  categories: Tables<"prompt_category">[]
  selected?: string
}) {
  return (
    <div className="flex space-x-2 py-4">
      {[...categories].map((cat, index: number) => (
        <Badge
          variant={cat.name === selected ? "default" : "outline"}
          key={index}
        >
          <Link href={"/prompts/" + cat.name}>{cat.name}</Link>
        </Badge>
      ))}
    </div>
  )
}
