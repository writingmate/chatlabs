import { FC } from "react"

interface AnthropicSVGProps {
  height?: number
  width?: number
  className?: string
}

export const MicrosoftSVG: FC<AnthropicSVGProps> = ({
  height = 40,
  width = 40,
  className
}) => {
  return (
    <div
      className={className}
      style={{
        width: width + "px",
        height: height + "px",
        backgroundImage:
          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='21' height='21'%3E%3Cpath fill='%23f25022' d='M1 1h9v9H1z'/%3E%3Cpath fill='%2300a4ef' d='M1 11h9v9H1z'/%3E%3Cpath fill='%237fba00' d='M11 1h9v9h-9z'/%3E%3Cpath fill='%23ffb900' d='M11 11h9v9h-9z'/%3E%3C/svg%3E\")"
      }}
    ></div>
  )
}
