"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"

interface TransitionProps {
  children: ReactNode
}

export default function Transition({ children }: TransitionProps) {
  const pathname = usePathname()
  return (
    <motion.div
      className="flex size-full"
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  )
}
