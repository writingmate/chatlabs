import React, { ReactNode, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ResizableSplitViewProps {
  className?: string
  numViews: number
  children: ReactNode[]
}

export const ResizableSplitView: React.FC<ResizableSplitViewProps> = ({
  className,
  numViews,
  children
}) => {
  const [sizes, setSizes] = useState<number[]>(
    Array(numViews).fill(100 / Math.min(numViews, 3))
  )

  const getGridTemplate = () => {
    if (numViews <= 3) return `grid grid-cols-${numViews}`
    if (numViews === 4) return "grid grid-cols-2 grid-rows-2"
    return "grid grid-cols-3 grid-rows-2"
  }

  const handleMouseDown = useCallback(
    (index: number) => (e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startSizes = [...sizes]

      const handleMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - startX
        const totalWidth =
          document.getElementById("split-view-container")?.offsetWidth || 0
        const newSizes = [...startSizes]

        const deltaPercentage = (dx / totalWidth) * 100
        newSizes[index] += deltaPercentage
        newSizes[index + 1] -= deltaPercentage

        // Ensure minimum size of 20% for each pane
        if (newSizes[index] >= 20 && newSizes[index + 1] >= 20) {
          setSizes(newSizes)
        }
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [sizes]
  )

  return (
    <div
      id="split-view-container"
      className={cn("grid h-full gap-3", getGridTemplate(), className)}
    >
      {children.map((child, index) => (
        <div key={index} className={"h-full"}>
          <div className="relative h-full overflow-auto rounded-xl border">
            {child}
          </div>
          {index % 3 !== 2 && index !== numViews - 1 && (
            <div
              className="bg-accent absolute -right-1 mx-[3px] my-[60px] w-[2px] cursor-col-resize"
              onMouseDown={() => handleMouseDown(index)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
