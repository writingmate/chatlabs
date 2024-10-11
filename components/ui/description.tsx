import { cn } from "@/lib/utils"
import React from "react"

interface DescriptionProps {
  children: React.ReactNode
  className?: string
}

export function Description({ children, className }: DescriptionProps) {
  return (
    <p className={cn("text-muted-foreground mt-1 text-xs", className)}>
      {children}
    </p>
  )
}
