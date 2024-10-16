"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "nextjs-toploader/app"
import { useContext, useEffect, useState } from "react"
import { ChatbotUIContext } from "@/context/context"
import confetti from "canvas-confetti"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { upsertUserQuestion } from "@/db/user_questions"
import Image from "next/image"

export default function SubscriptionSuccessPage() {
  const { profile } = useContext(ChatbotUIContext)
  const [response, setResponse] = useState("")

  useEffect(() => {
    if (profile && profile.plan != "free") {
      const event = `purchase_${profile.plan}`
      window.gtag?.("event", event)
      window.dataLayer?.push({ event })
    }

    confetti({
      particleCount: 100,
      startVelocity: 30,
      spread: 360,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2
      }
    })
  }, [profile])

  function sendResponse() {
    if (!profile?.user_id) return

    upsertUserQuestion({
      user_id: profile?.user_id,
      purchase_reason: response
    })

    router.push("/")
  }

  const router = useRouter()
  return (
    <div className="size-screen flex size-full flex-col items-center justify-center">
      <Image
        src="https://media.licdn.com/dms/image/D5603AQF7L8gHvNGeNQ/profile-displayphoto-shrink_400_400/0/1699576720025?e=1728518400&v=beta&t=KsJYhiJqBFSn5vf0YERo4aDO8ZU1IJZgqljPtDkV3SQ"
        alt="Artem"
        width={100}
        height={100}
        className="mb-4 rounded-full"
      />
      <div className="mb-6 max-w-2xl text-center text-2xl">
        Hi, my name is Artem and I am co-founder of ChatLabs. Thank you for
        subscribing to our product.
      </div>
      <div className="mb-6 max-w-2xl text-center">
        We are dedicated to making this the best possible experience you can
        have with an LLM. We have one question before you get started.
      </div>
      <div className={"min-w-[300px] py-4 text-center"}>
        <Label className="mt-8 text-lg font-bold">
          What outcome do you hope this product will help you achieve?
        </Label>
        <Textarea
          value={response}
          onChange={e => setResponse(e.target.value)}
          required={true}
          placeholder={"Write your response here...."}
          className="mt-4"
        ></Textarea>
        <div className="text-muted-foreground mt-2 text-sm">
          I personally read every response and will make sure I do my best to
          deliver on this.
        </div>
      </div>
      <Button className="mt-8" onClick={sendResponse}>
        Submit and start chatting
      </Button>
    </div>
  )
}
