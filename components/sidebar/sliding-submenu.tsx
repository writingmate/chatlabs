import { FC, ReactNode } from "react"
import { ContentType } from "@/types"
import { AnimatePresence, motion } from "framer-motion"

interface SlidingSubmenuProps {
  children: ReactNode
  isOpen: boolean
  contentType: ContentType
  isCollapsed: boolean
}

export const SlidingSubmenu: FC<SlidingSubmenuProps> = ({
  children,
  isOpen,
  contentType,
  isCollapsed
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={isCollapsed ? { x: 0, opacity: 0 } : { x: "-100%" }}
          animate={{ x: 0, opacity: 1 }}
          exit={isCollapsed ? { x: 0, opacity: 0 } : { x: "-100%" }}
          transition={{ type: "tween", duration: 0.2 }}
          className="bg-background absolute inset-y-0 left-0 z-10 w-full"
          style={{ top: "49px" }}
        >
          <div className="flex h-full grow flex-col overflow-y-auto p-2">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
