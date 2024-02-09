"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  return (
    <div className="size-screen flex size-full flex-col items-center justify-center">
      <div className="text-4xl">You have successfully subscribed.</div>
      <Button className="mt-8" onClick={() => router.push("/")}>
        Start chatting
      </Button>
    </div>
  )
}
