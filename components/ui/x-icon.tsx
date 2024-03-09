import { IconX } from "@tabler/icons-react"
import { forwardRef } from "react"
import { Table } from "@/components/ui/table"
import { cn } from "@/lib/utils"

const XIcon = forwardRef<SVGSVGElement, React.HTMLAttributes<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <IconX
      className={cn(
        "bg-foreground/5 flex size-5 max-w-[calc(100vw-40px)] cursor-pointer items-center justify-center rounded-full text-[10px] sm:max-w-[calc(100%-10px)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)

XIcon.displayName = "XIcon"

export { XIcon }
