import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Annotation, Annotation2 } from "@/types/annotation"
import { useState } from "react"
import { ChatSelectedHtmlElements } from "@/components/chat/chat-selected-html-elements"
import { Badge } from "@/components/ui/badge"

export function SelectedHtmlElements({
  annotation
}: {
  annotation: Annotation | Annotation2
}) {
  if (!("selected_html_elements" in annotation)) {
    return null
  }

  const elements = annotation.selected_html_elements

  if (!elements || elements.length === 0) {
    return null
  }

  return (
    <div className={"mb-2 flex"}>
      {elements.map((element, index) => (
        <Badge
          key={index}
          className="group relative flex items-center justify-between"
        >
          {element.xpath}
        </Badge>
      ))}
    </div>
  )
}
