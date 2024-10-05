import { IconPencil } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import questions from "@/data/mt-bench/questions.json"
import { useState } from "react"

export function PromptCatalog({
  onSelect
}: {
  onSelect: (value: string) => void
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    questions[0].category
  )
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

  const categories = questions.reduce((acc, question) => {
    if (!acc.includes(question.category)) {
      acc.push(question.category)
    }
    return acc
  }, [] as string[])

  const handleSelect = (value: string) => {
    onSelect(value)
    setIsDialogOpen(false)
  }

  return (
    <Dialog open={isDialogOpen}>
      <DialogTrigger onClick={() => setIsDialogOpen(true)}>
        <IconPencil
          size={32}
          className={"hover:opactity-50 cursor-pointer p-1"}
        />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>MT Bench Prompts</DialogTitle>
        <select
          className={"border-input rounded-md border p-2 capitalize"}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          {categories.map((category, index) => {
            return (
              <option key={index} value={category}>
                {category}
              </option>
            )
          })}
        </select>
        <div className={"grid grid-cols-2 gap-2"}>
          {questions
            .filter(question => question.category === selectedCategory)
            .map((question, index) => {
              return (
                <div
                  className={
                    "hover:bg-foreground/10 overflow-hidden text-ellipsis rounded-md border p-2 text-sm hover:cursor-pointer"
                  }
                  key={index}
                  onClick={() => handleSelect(question.turns[0])}
                >
                  <div className={"line-clamp-4"}>{question.turns[0]}</div>
                </div>
              )
            })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
