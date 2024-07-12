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

export const useScroll = () => {
  const { isGenerating, chatMessages } = useContext(ChatbotUIChatContext)

  const messagesStartRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isAutoScrolling = useRef(false)

  const [isAtTop, setIsAtTop] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [userScrolled, setUserScrolled] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)

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

  const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(e => {
    const target = e.target as HTMLDivElement
    const bottom =
      Math.round(target.scrollHeight) - Math.round(target.scrollTop) ===
      Math.round(target.clientHeight)
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
    if (messagesEndRef.current) {
      if (window.self !== window.top) {
        console.log(
          "scrolling to top",
          messagesEndRef.current?.offsetTop,
          document.documentElement.scrollTop
        )
        if (scrollRef.current) {
          scrollRef.current.scrollTop = messagesEndRef.current?.offsetTop
          return
        }
        return
      }
      messagesEndRef.current.scrollIntoView({ behavior: "instant" })
    }
  }

  const scrollToTop = useCallback(() => {
    // if the window is inside an iframe, we can't scroll to the top
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
