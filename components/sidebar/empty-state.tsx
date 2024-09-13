import { FC } from "react"
import { IconMoodEmpty } from "@tabler/icons-react"

interface EmptyStateProps {
  message: string
  description: string
}

export const EmptyState: FC<EmptyStateProps> = ({ message, description }) => {
  return (
    <div className="text-muted-foreground flex h-32 shrink-0 flex-col items-center justify-center px-4 text-center">
      <IconMoodEmpty size={24} className="mb-2" />
      <p className="mb-1 text-sm font-semibold">{message}</p>
      <p className="text-xs">{description}</p>
    </div>
  )
}
