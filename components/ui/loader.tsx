"use client"

import { useEffect, useState } from "react"
import { IconLoader2 } from "@tabler/icons-react"
import { FC } from "react"

const messages = [
  "Training my neural networks...",
  "Optimizing algorithms...",
  "Just a few more bytes...",
  "Teaching AI to be funny...",
  "Loading the future..."
]

interface LoaderProps {}

export const Loader: FC<LoaderProps> = () => {
  const [message, setMessage] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      const randomMessage =
        messages[Math.floor(Math.random() * (messages.length - 1))]
      setMessage(randomMessage)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="animate-fade-in flex size-full flex-col items-center justify-center">
      <div className="flex h-[100px] flex-col items-center justify-center">
        <IconLoader2 className="size-12 animate-spin" />
        {message && (
          <p className="text-muted-foreground mt-4 text-sm">{message}</p>
        )}
      </div>
    </div>
  )
}
