import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type UIEventHandler
} from "react"
import { ChatbotUIChatContext } from "@/context/chat"
import { ChatbotUIContext } from "@/context/context"

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
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [userScrolled, setUserScrolled] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)

  const checkIsAtBottom = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, clientHeight, scrollHeight } = scrollRef.current
      const bottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 40
      setIsAtBottom(bottom)
    }
  }, [scrollRef, setIsAtBottom])

  useEffect(() => {
    const currentRef = scrollRef.current
    if (currentRef) {
      const resizeObserver = new ResizeObserver(() => {
        checkIsAtBottom()
      })

      resizeObserver.observe(currentRef)

      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [checkIsAtBottom])

  const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(
    e => {
      const target = e.target as HTMLDivElement

      const isOverflow = target.scrollHeight > target.clientHeight
      setIsOverflowing(isOverflow)

      checkIsAtBottom()

      const top = target.scrollTop === 0
      setIsAtTop(top)

      if (!isAtBottom && !isAutoScrolling.current) {
        setUserScrolled(true)
      } else {
        setUserScrolled(false)
      }
    },
    [checkIsAtBottom, isAtBottom]
  )

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
    setUserScrolled,
    checkIsAtBottom
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
