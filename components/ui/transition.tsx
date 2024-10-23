"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

interface TransitionProps {
  children: ReactNode
}

export default function Transition({ children }: TransitionProps) {
  const pathname = usePathname()

  const pathParts = pathname?.split("/") || []
  const rootFolder = pathParts?.length > 1 ? pathParts[1] : ""
  return (
    <motion.div
      className="flex size-full"
      key={rootFolder}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  )
}
