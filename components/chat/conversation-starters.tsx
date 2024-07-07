import { Button } from "@/components/ui/button"
import { useMemo } from "react"

const MAX_CONVERSATION_STARTERS = 4

export function ConversationStarters({
  values,
  onSelect
}: {
  values?: Array<string>
  onSelect: (starter: string) => void
}) {
  const hash = values?.sort().join("")

  return useMemo(() => {
    const trimmedValues = values
      // randomize the order
      ?.sort(() => Math.random() - 0.5)
      // pick the first {MAX_CONVERSATION_STARTERS} starters
      .slice(0, MAX_CONVERSATION_STARTERS)

    return (
      <div className="grid w-full grid-cols-2 items-start justify-center gap-2">
        {trimmedValues?.map((starter, index) => (
          <Button
            onClick={() => onSelect(starter)}
            variant={"outline"}
            key={index}
            className="text-foreground rounded-xl text-left text-sm font-normal shadow-none"
          >
            {starter}
          </Button>
        ))}
      </div>
    )
  }, [hash])
}
