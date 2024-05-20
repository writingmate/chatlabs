"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useContext, useEffect } from "react"
import { ChatbotUIContext } from "@/context/context"

export default function SubscriptionSuccessPage() {
  const { profile } = useContext(ChatbotUIContext)

  useEffect(() => {
    if (profile && profile.plan != "free") {
      const event = `purchase_${profile.plan}`
      window.gtag?.("event", event)
      window.dataLayer?.push({ event })
    }
  }, [profile])

  const router = useRouter()
  return (
    <div className="size-screen flex size-full flex-col items-center justify-center">
      <div className="text-center text-4xl">
        You have successfully subscribed.
      </div>
      <Button className="mt-8" onClick={() => router.push("/")}>
        Start chatting
      </Button>
    </div>
  )
}
