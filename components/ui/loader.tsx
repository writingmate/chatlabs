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
const MESSAGE_INTERVAL = 3000
const FADE_DURATION = 500 // Duration for fade effect in milliseconds

interface LoaderProps {}

export const Loader: FC<LoaderProps> = () => {
  const [messageIndex, setMessageIndex] = useState(0)
  const [message, setMessage] = useState("")
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Set initial message
    setMessage(messages[0])

    const changeMessage = () => {
      setIsVisible(false) // Start fade out
      setTimeout(() => {
        setMessageIndex(prevIndex => {
          const newIndex = (prevIndex + 1) % messages.length
          setMessage(messages[newIndex])
          return newIndex
        })
        setIsVisible(true) // Start fade in
      }, FADE_DURATION)
    }

    const timer = setTimeout(() => {
      changeMessage() // First message change after initial timeout
      const interval = setInterval(changeMessage, MESSAGE_INTERVAL)
      return () => clearInterval(interval)
    }, INITIAL_TIMEOUT)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="animate-fade-in flex size-full flex-col items-center justify-center">
      <div className="flex h-[160px] flex-col items-center justify-start">
        <IconLoader2 className="size-12 animate-spin" />
        <div className="mt-4 h-8">
          {" "}
          {/* Fixed height container for message */}
          {message && (
            <p
              className={`text-muted-foreground text-sm transition-opacity duration-1000 ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
