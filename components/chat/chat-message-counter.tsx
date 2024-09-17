import { ChatbotUIContext } from "@/context/context"
import { useContext, useEffect, useState } from "react"
import {
  FREE_MESSAGE_DAILY_LIMIT,
  PRO_ULTIMATE_MESSAGE_DAILY_LIMIT,
  ULTIMATE_MESSAGE_DAILY_LIMIT
} from "@/lib/subscription"
import { getMessageCountForModel } from "@/db/messages"
import { Button } from "@/components/ui/button"
import { ChatbotUIChatContext } from "@/context/chat"
import { LLM_LIST } from "@/lib/models/llm/llm-list"

interface ChatMessageCounterProps {}

const ChatMessageCounter: React.FC<ChatMessageCounterProps> = () => {
  const { profile, setIsPaywallOpen } = useContext(ChatbotUIContext)
  const { isGenerating, chatSettings } = useContext(ChatbotUIChatContext)
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    if (!profile) {
      return
    }
    const fetchMessageCount = async () => {
      if (!chatSettings?.model) {
        return
      }
      const count = await getMessageCountForModel(chatSettings?.model)
      setMessageCount(count || 0)
    }
    fetchMessageCount()
  }, [profile, isGenerating, chatSettings])

  if (!profile || !chatSettings?.model) {
    return null
  }

  const userPlan = profile.plan.split("_")[0]
  const modelData = LLM_LIST.find(x => x.modelId === chatSettings.model)
  const modelTier = modelData?.tier

  let limit = FREE_MESSAGE_DAILY_LIMIT
  let showCounter = true

  if (userPlan === "ultimate") {
    if (modelTier === "ultimate" && profile.created_at > "2024-09-16") {
      limit = ULTIMATE_MESSAGE_DAILY_LIMIT
    } else {
      showCounter = false
    }
  } else if (userPlan === "pro") {
    if (modelTier === "ultimate" && profile.created_at > "2024-09-16") {
      limit = PRO_ULTIMATE_MESSAGE_DAILY_LIMIT
    } else {
      showCounter = false
    }
  }

  if (userPlan === "byok") {
    showCounter = false
  }

  if (!showCounter) {
    return null
  }

  return (
    <div className={"text-foreground/80 w-full p-2 text-center text-xs"}>
      {limit - messageCount}/{limit} messages left today.
      {userPlan === "free" && (
        <>
          {" "}
          All generated images and web search results are public.{" "}
          <Button
            size={"xs"}
            className={"px-0 text-xs"}
            variant={"link"}
            onClick={() => setIsPaywallOpen(true)}
          >
            Upgrade to Pro
          </Button>
        </>
      )}
      {userPlan === "pro" && (
        <>
          {" "}
          To increase your message limit,{" "}
          <Button
            size={"xs"}
            className={"px-0 text-xs"}
            variant={"link"}
            onClick={() => setIsPaywallOpen(true)}
          >
            upgrade to Ultimate
          </Button>
          .
        </>
      )}
    </div>
  )
}

export { ChatMessageCounter }
