import { ChatbotUIContext } from "@/context/context"
import { useContext, useEffect, useState } from "react"
import { FREE_MESSAGE_DAILY_LIMIT, validateProPlan } from "@/lib/subscription"
import { getMessageCount } from "@/db/messages"
import { Button } from "@/components/ui/button"
import { ChatbotUIChatContext } from "@/context/chat"

interface ChatMessageCounterProps {}

const ChatMessageCounter: React.FC<ChatMessageCounterProps> = () => {
  const { profile, setIsPaywallOpen } = useContext(ChatbotUIContext)
  const { isGenerating } = useContext(ChatbotUIChatContext)
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    if (!profile) {
      return
    }
    const fetchMessageCount = async () => {
      const count = await getMessageCount()
      setMessageCount(count || 0)
    }
    fetchMessageCount()
  }, [profile, isGenerating])

  if (!profile) {
    return null
  }

  if (validateProPlan(profile)) {
    return null // Do not display the counter for non-free plans
  }

  return (
    <div className={"text-foreground/80 w-full p-2 text-center text-xs"}>
      You have messages {Math.max(FREE_MESSAGE_DAILY_LIMIT - messageCount, 0)}/
      {FREE_MESSAGE_DAILY_LIMIT} left.{" "}
      <Button
        size={"xs"}
        className={"px-0 text-xs"}
        variant={"link"}
        onClick={() => setIsPaywallOpen(true)}
      >
        Upgrade to Pro
      </Button>
      .
    </div>
  )
}

export { ChatMessageCounter }
