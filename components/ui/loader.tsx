"use client"

import { useEffect, useState } from "react"
import { LoadingSVG } from "@/components/icons/loading-svg"
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

interface LoaderProps {
  withMessage?: boolean
}

export const Loader: FC<LoaderProps> = ({ withMessage = false }) => {
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

  if (!withMessage) {
    return (
      <div className="flex size-full flex-col items-center justify-center">
        <LoadingSVG className="size-12" />
      </div>
    )
  }

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <LoadingSVG className="mb-4 size-12" />
      <div
        className={`duration- text-center transition-opacity${FADE_DURATION} ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {message}
      </div>
    </div>
  )
}
