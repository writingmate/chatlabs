import { ChatbotUIContext } from "@/context/context"
import { useContext, useEffect, useState } from "react"
import { validateProPlan } from "@/lib/subscription"
import { getMessageCount } from "@/db/messages"
import { Button } from "@/components/ui/button"

interface ChatMessageCounterProps {}

const ChatMessageCounter: React.FC<ChatMessageCounterProps> = () => {
  const { profile, setIsPaywallOpen } = useContext(ChatbotUIContext)
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
  }, [profile])

  if (!profile) {
    return null
  }

  if (validateProPlan(profile)) {
    return null // Do not display the counter for non-free plans
  }

  return (
    <div className={"text-foreground/80 w-full p-2 text-center text-xs"}>
      You have messages {Math.max(10 - messageCount, 0)}/10 left.{" "}
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
