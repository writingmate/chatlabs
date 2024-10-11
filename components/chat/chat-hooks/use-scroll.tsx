import { ChatbotUIContext } from "@/context/context"
import {
  type UIEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react"
import { ChatbotUIChatContext } from "@/context/chat"

// Base hook for scroll management, without any chat-specific logic
export const useScrollBase = (
  scrollParams: any = {
    ref: null
  }
) => {
  const startRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(scrollParams.ref)
  const isAutoScrolling = useRef(false)

  const [isAtTop, setIsAtTop] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [userScrolled, setUserScrolled] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)

  const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(e => {
    const target = e.target as HTMLDivElement

    const bottom =
      Math.ceil(target.scrollTop + target.clientHeight) >=
      target.scrollHeight - 60

    setIsAtBottom(bottom)

    const top = target.scrollTop === 0
    setIsAtTop(top)

    if (!bottom && !isAutoScrolling.current) {
      setUserScrolled(true)
    } else {
      setUserScrolled(false)
    }

    const isOverflow = target.scrollHeight > target.clientHeight
    setIsOverflowing(isOverflow)
  }, [])

  function scrollIntoView() {
    if (endRef.current) {
      if (window.self !== window.top) {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = endRef.current?.offsetTop
          return
        }
        return
      }
      endRef.current.scrollIntoView({
        behavior: "instant",
        ...scrollParams
      })
    }
  }

  const scrollToTop = useCallback(() => {
    scrollIntoView()
  }, [])

  const scrollToBottom = useCallback(() => {
    isAutoScrolling.current = true

    setTimeout(() => {
      scrollIntoView()

      isAutoScrolling.current = false
    }, 0)
  }, [])

  return {
    scrollRef,
    startRef,
    endRef,
    isAtTop,
    isAtBottom,
    userScrolled,
    isOverflowing,
    handleScroll,
    scrollToTop,
    scrollToBottom,
    setIsAtBottom,
    setUserScrolled // Add this line to expose setUserScrolled
  }
}

// Hook for scroll management, with chat-specific logic
export const useScroll = (scrollParams: any = {}) => {
  const { isGenerating, chatMessages } = useContext(ChatbotUIChatContext)

  const {
    scrollRef,
    startRef: messagesStartRef,
    endRef: messagesEndRef,
    isAtTop,
    isAtBottom,
    userScrolled,
    isOverflowing,
    handleScroll,
    scrollToTop,
    scrollToBottom,
    setIsAtBottom,
    setUserScrolled // Destructure setUserScrolled here
  } = useScrollBase(scrollParams)

  useEffect(() => {
    setUserScrolled(false)

    if (!isGenerating && userScrolled) {
      setUserScrolled(false)
    }
  }, [isGenerating])

  useEffect(() => {
    if (isGenerating && !userScrolled) {
      scrollToBottom()
    }
  }, [chatMessages])

  return {
    scrollRef,
    messagesStartRef,
    messagesEndRef,
    isAtTop,
    isAtBottom,
    userScrolled,
    isOverflowing,
    handleScroll,
    scrollToTop,
    scrollToBottom,
    setIsAtBottom
  }
}
