import React, { useState, useEffect, useRef } from "react"
import { IconCircleFilled } from "@tabler/icons-react"
import { useTranslation } from "react-i18next"

const WAITING_MESSAGES = [
  "Hang tight! The AI is processing your request at the speed of thought...",
  "Plot twist: The AI is fine-tuning its neural pathways...",
  "The AI is currently juggling billions of parameters...",
  "Our AI is consulting its vast knowledge base...",
  "Hold on, the language model is busy expanding its vocabulary...",
  "The AI is currently in a heated debate with its training data...",
  "The AI is performing complex natural language processing... or trying to understand memes."
]

interface LoadingMessageProps {
  isGenerating: boolean
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({
  isGenerating
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showWaitingMessage, setShowWaitingMessage] = useState(false)
  const waitingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (isGenerating) {
      waitingTimerRef.current = setTimeout(() => {
        setShowWaitingMessage(true)
        rotationTimerRef.current = setInterval(() => {
          setCurrentMessageIndex(
            prevIndex => (prevIndex + 1) % WAITING_MESSAGES.length
          )
        }, 5000)
      }, 6000)
    } else {
      setShowWaitingMessage(false)
      setCurrentMessageIndex(0)
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current)
      }
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current)
      }
    }

    return () => {
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current)
      }
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current)
      }
    }
  }, [isGenerating])

  if (!isGenerating) return null

  return (
    <div className="flex items-start space-x-2">
      <div className="bg-foreground mt-1 flex size-3 items-center justify-center rounded-full">
        <IconCircleFilled className="animate-ping" size={20} />
      </div>
      {showWaitingMessage && (
        <div className="relative h-[20px] w-full overflow-hidden">
          {t("WAITING_MESSAGES")
            .split("|")
            .map((message, index) => (
              <div
                key={index}
                className={`
                text-foreground/60 absolute inset-0 text-sm
                transition-opacity duration-500 ease-in-out
                ${index === currentMessageIndex ? "opacity-100" : "opacity-0"}
              `}
              >
                {message}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
