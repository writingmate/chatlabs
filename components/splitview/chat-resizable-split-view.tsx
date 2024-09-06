import React, { useState, useEffect, useCallback } from "react"

interface ResizableSplitViewProps {
  leftContent: React.ReactNode
  rightContent: React.ReactNode
  minWidth?: number
  initialLeftWidth?: number
  className?: string
}

export const ResizableSplitView: React.FC<ResizableSplitViewProps> = ({
  leftContent,
  rightContent,
  minWidth = 400,
  initialLeftWidth = 50,
  className = ""
}) => {
  const [leftWidthPercent, setLeftWidthPercent] = useState(initialLeftWidth)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    document.body.style.cursor = "default"
    document.body.style.userSelect = "auto"
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      const container = document.getElementById("split-view-container")
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const newLeftWidth = e.clientX - containerRect.left
      const containerWidth = containerRect.width

      const newLeftWidthPercent = (newLeftWidth / containerWidth) * 100
      const minWidthPercent = (minWidth / containerWidth) * 100
      const maxWidthPercent = 100 - minWidthPercent

      if (
        newLeftWidthPercent >= minWidthPercent &&
        newLeftWidthPercent <= maxWidthPercent
      ) {
        setLeftWidthPercent(newLeftWidthPercent)
      }
    },
    [isDragging, minWidth]
  )

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div id="split-view-container" className={`flex h-full ${className}`}>
      <div
        style={{ width: `${leftWidthPercent}%` }}
        className="h-full rounded-xl border"
      >
        {leftContent}
      </div>
      <div
        className="bg-accent mx-[3px] my-[60px] w-[2px] cursor-col-resize"
        onMouseDown={handleMouseDown}
      />
      <div
        style={{ width: `${100 - leftWidthPercent}%` }}
        className="h-full rounded-xl border"
      >
        {rightContent}
      </div>
    </div>
  )
}
