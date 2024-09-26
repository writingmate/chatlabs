"use client"
import { Button } from "@/components/ui/button"

export default function CancelSubscriptionPage() {
  return (
    <div className="size-screen flex size-full flex-col items-center justify-center">
      <div className="text-center text-4xl">You have not subscribed.</div>
      <Button className="mt-8" onClick={() => (window.location.href = "/chat")}>
        Go back
      </Button>
    </div>
  )
}
