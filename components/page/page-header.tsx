// header component wuth tailwind css

import React from "react"
import { cn } from "@/lib/utils"

type HeaderProps = {
  children: React.ReactNode
  className?: string
}

const Header = ({ children, className }: HeaderProps) => {
  return <div className={cn("p-4", className)}>{children}</div>
}

export default Header
