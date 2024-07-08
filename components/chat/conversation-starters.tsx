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
      <div className="grid w-full grid-cols-2 items-start justify-center gap-2 pb-2">
        {trimmedValues?.map((starter, index) => (
          <Button
            onClick={() => onSelect(starter)}
            variant={"outline"}
            key={index}
            title={starter}
            className="text-foreground overflow-hidden rounded-xl px-3 text-left text-sm font-normal shadow-none"
          >
            <span className="block truncate">{starter}</span>
          </Button>
        ))}
      </div>
    )
  }, [hash])
}
