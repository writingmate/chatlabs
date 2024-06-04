import { cn } from "@/lib/utils"

type PageContentProps = {
  className?: string
  children: React.ReactNode
}

export default function PageContent({ children, className }: PageContentProps) {
  return (
    <div
      className={cn(
        "flex size-full flex-col items-center justify-center self-center py-4",
        className
      )}
    >
      {children}
    </div>
  )
}
