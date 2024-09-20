import { FC } from "react"

interface IconAiSVGProps {
  size?: number
  stroke?: number
  className?: string
  onClick?: () => void // Add this line
}

export const IconAiSVG: FC<IconAiSVGProps> = ({
  size = 20, // Reduced default size to match other icons
  className = "",
  onClick
}) => {
  return (
    <svg
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(8,7.5)">
        {" "}
        {/* Adjusted vertical centering */}
        <path d="M-3 4.5V-1.5a2 2 0 1 1 4 0v6" />{" "}
        {/* Adjusted vertical position */}
        <path d="M-3 1.5h4" /> {/* Adjusted crossbar */}
        <path d="M5 -3.5v8" /> {/* Adjusted "I" position */}
      </g>
    </svg>
  )
}
