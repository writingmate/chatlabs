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

const INITIAL_TIMEOUT = 3000
const MESSAGE_INTERVAL = 2000

interface LoaderProps {}

export const Loader: FC<LoaderProps> = () => {
  const [message, setMessage] = useState("")

  useEffect(() => {
    let interval: NodeJS.Timeout
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        const randomMessage =
          messages[Math.floor(Math.random() * (messages.length - 1))]
        setMessage(randomMessage)
      }, INITIAL_TIMEOUT)
    }, MESSAGE_INTERVAL)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
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
