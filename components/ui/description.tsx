import React from "react"

interface DescriptionProps {
  children: React.ReactNode
}

export function Description({ children }: DescriptionProps) {
  return <p className="mb-2 text-xs text-gray-500">{children}</p>
}
