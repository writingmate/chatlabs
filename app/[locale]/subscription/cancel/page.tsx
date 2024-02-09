"use client"
import { Button } from "@/components/ui/button"

export default function CancelSubscriptionPage() {
  return (
    <div className="size-screen flex size-full flex-col items-center justify-center">
      <div className="text-4xl">Subscription cancelled.</div>
      <Button className="mt-8" onClick={() => window.history.back()}>
        Go back
      </Button>
    </div>
  )
}
