import { FC, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SlidingSubmenuProps {
  children: ReactNode
  isOpen: boolean
}

export const SlidingSubmenu: FC<SlidingSubmenuProps> = ({
  children,
  isOpen
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="bg-background absolute inset-y-0 left-0 z-10 w-full"
          style={{ top: "49px" }} // Adjust this value based on your header height
        >
          <div className="flex h-full grow flex-col overflow-y-auto p-2">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
