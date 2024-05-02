import { Annotation } from "@/types/annotation"
import { forwardRef, useRef } from "react"
import { IconFunction, IconPlayerPlay } from "@tabler/icons-react"

type YouTubeProps = {
  annotation: Annotation
}

type ResponseTimeProps = {
  icon?: JSX.Element
  label: string
  value: string
}

export function ResponseTime({ icon, label, value }: ResponseTimeProps) {
  icon = icon || <IconFunction stroke={1.5} size={18} />

  return (
    <div className={"text-foreground/70 flex items-center font-mono text-xs"}>
      <div className={"px-2"}>{icon}</div>
      {label}:{" "}
      <span className={"text-foreground px-1"}>
        {" "}
        {value && (parseInt(value) / 1000).toFixed(2)}{" "}
      </span>
      sec
    </div>
  )
}

const ToolCalls = forwardRef<HTMLAnchorElement, YouTubeProps>(
  ({ annotation }: { annotation: Annotation }, ref) => {
    return (
      annotation.toolCalls?.responseTime && (
        <ResponseTime
          label={"Func call"}
          value={annotation.toolCalls?.responseTime}
        />
      )
    )
  }
)

ToolCalls.displayName = "ToolCalls"

export { ToolCalls }
