import { IconCheck, IconClipboard } from "@tabler/icons-react"

import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { ButtonWithTooltip } from "./button-with-tooltip"

export function CopyButton({
  value,
  title = "Copy to clipboard",
  variant = "link",
  className
}: {
  value: string
  variant?: "link" | "outline"
  title?: string
  className?: string
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  return (
    <ButtonWithTooltip
      tooltip={title}
      size={"icon"}
      className={cn("size-4 text-red-800 hover:opacity-50", className)}
      variant={variant}
      onClick={() => {
        if (isCopied) return
        copyToClipboard(value)
      }}
    >
      {isCopied ? (
        <IconCheck stroke={1.5} size={16} />
      ) : (
        <IconClipboard stroke={1.5} size={16} />
      )}
    </ButtonWithTooltip>
  )
}
