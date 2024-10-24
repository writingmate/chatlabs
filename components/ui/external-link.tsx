import React from "react"
import Link from "next/link"
import { IconExternalLink } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

interface ExternalLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
  className?: string
}

export function ExternalLink({
  href,
  children,
  className = "",
  ...props
}: ExternalLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center underline", className)}
      {...props}
    >
      {children}
      <IconExternalLink stroke={1.5} className="ml-1 size-4" />
    </Link>
  )
}
