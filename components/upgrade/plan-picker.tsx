import { ChatbotUIContext } from "@/context/context"
import { sendGTMEvent } from "@next/third-parties/google"
import { IconCheck, IconSparkles, IconX } from "@tabler/icons-react"
import { FC, useContext, useEffect, useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogClose,
  DialogTitle
} from "../ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { createCheckoutSession } from "@/actions/stripe"
import { supabase } from "@/lib/supabase/browser-client"
import { useTheme } from "next-themes"

interface PlanPickerProps {}

export function PlanFeature({ title }: { title: string }) {
  return (
    <div className="bg-token-main-surface-primary relative">
      <div className="text-l flex justify-start gap-2">
        <div className="w-8 shrink-0">
          <IconCheck size={18} />
        </div>
        <span>{title}</span>
      </div>
    </div>
  )
}

export const PlanPicker: FC<PlanPickerProps> = () => {
  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly">(
    "yearly"
  )

  const { theme } = useTheme()

  const { isPaywallOpen, setIsPaywallOpen, profile } =
    useContext(ChatbotUIContext)

  const formAction = async (data: FormData): Promise<void> => {
    const user = (await supabase.auth.getUser()).data.user

    if (!user) {
      throw new Error("User not found")
    }

    data.set("email", user?.email as string)
    data.set("userId", user?.id)

    const { url } = await createCheckoutSession(data)

    window.location.assign(url as string)
  }

  // const formActionPremium = async (data: FormData) => {
  //   data.set("plan", "premium_" + data.get("billingCycle"))
  //   return formAction(data)
  // }

  const formActionPro = async (data: FormData) => {
    data.set("plan", "pro_" + data.get("billingCycle"))
    return formAction(data)
  }

  return (
    <Dialog open={isPaywallOpen} onOpenChange={setIsPaywallOpen}>
      <DialogContent className="sm:max-w-2xl sm:border">
        <form method={"POST"}>
          <input type={"hidden"} value={billingCycle} name={"billingCycle"} />
          <DialogHeader>
            <DialogTitle className={"flex justify-between"}>
              <div>Upgrade your plan</div>
              <DialogClose>
                <IconX
                  className="text-token-text-primary cursor-pointer"
                  size={18}
                />
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          <div className="my-2">
            <ToggleGroup
              type={"single"}
              value={billingCycle}
              onValueChange={value =>
                setBillingCycle(value as "yearly" | "monthly")
              }
            >
              <ToggleGroupItem value={"yearly"}>Yearly</ToggleGroupItem>
              <ToggleGroupItem value={"monthly"}>Monthly</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex flex-col md:flex-row">
            {profile?.plan == "free" && (
              <div
                className="border-token-border-light relative flex flex-1 flex-col gap-5 border-t px-6 py-4 text-sm last:border-r-0 md:max-w-xs md:border-r md:border-t-0"
                data-testid="free-pricing-modal-column"
              >
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <div className="flex flex-col gap-1">
                    <p className="flex items-center gap-2 text-xl font-medium">
                      Free
                    </p>
                    <div className="min-h-[56px] flex-col items-baseline gap-[6px]">
                      <p
                        className="text-token-text-tertiary text-base font-light"
                        data-testid="free-pricing-column-cost"
                      >
                        $0/month
                      </p>
                      <div className="text-token-text-tertiary text-xs font-light">
                        Forever free, <br />
                        no credit card required
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <Button disabled={true}>Your current plan</Button>
                </div>
                <div className="flex grow flex-col gap-2">
                  <div className="bg-token-main-surface-primary relative flex flex-col">
                    <p className="text-l font-medium">
                      For people just getting started with Writingmate
                    </p>
                  </div>
                  <PlanFeature
                    title={
                      "Unlimited access to GPT-3.5 Turbo, Mistral Tiny, Perplexity 7B"
                    }
                  />
                  <PlanFeature title={"Access to ChatLabs"} />
                  <PlanFeature title={"Access to Chrome Extension"} />
                </div>
              </div>
            )}
            {profile?.plan.startsWith("premium_") && (
              <div
                className="border-token-border-light relative flex flex-1 flex-col gap-5 border-t px-6 py-4 text-sm last:border-r-0 md:max-w-xs md:border-r md:border-t-0"
                data-testid="Premium-pricing-modal-column"
              >
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <div className="flex flex-col gap-1">
                    <p className="flex items-center gap-2 text-xl font-medium">
                      <IconSparkles className={"text-violet-700"} />
                      Premium
                    </p>
                    <div className="flex items-baseline gap-[6px]">
                      <div className="min-h-[56px] flex-col items-baseline gap-[6px]">
                        <p
                          className="text-token-text-tertiary text-base font-light"
                          data-testid="Pro-pricing-column-cost"
                        >
                          {billingCycle === "yearly"
                            ? "$9.99/month"
                            : "$14.99/year"}
                        </p>
                        <p
                          className={
                            "text-token-text-tertiary text-xs font-light"
                          }
                        >
                          after free trial <br />
                          {billingCycle === "yearly" &&
                            "billed yearly $119.88/year"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <Button disabled={true}>Your current plan</Button>
                </div>
                <div className="flex grow flex-col gap-2">
                  <div className="bg-token-main-surface-primary relative flex flex-col">
                    <p className="text-l font-medium">
                      Everything in {profile?.plan}, and:
                    </p>
                  </div>
                  <PlanFeature title={"Unlimited GPT-3.5 messages"} />
                  <PlanFeature
                    title={"150 queries per month for Image generation"}
                  />
                  <PlanFeature title={"300 queries per month for Web Chat"} />
                  <PlanFeature
                    title={
                      "Summarize, explain, translate, extract information from any web page"
                    }
                  />
                  <PlanFeature title={"Priority feature requests"} />
                </div>
              </div>
            )}
            <div
              className="border-token-border-light relative flex flex-1 flex-col gap-5 border-t px-6 py-4 text-sm last:border-r-0 md:max-w-xs md:border-r md:border-t-0"
              data-testid="Pro-pricing-modal-column"
            >
              <div className="bg-token-main-surface-primary relative flex flex-col">
                <div className="flex flex-col gap-1">
                  <p className="flex items-center gap-2 text-xl font-medium">
                    <IconSparkles
                      className={theme === "dark" ? "text-white" : "text-black"}
                    />
                    Pro
                  </p>
                  <div className="min-h-[56px] flex-col items-baseline gap-[6px]">
                    <p
                      className="text-token-text-tertiary text-base font-light"
                      data-testid="Pro-pricing-column-cost"
                    >
                      {billingCycle === "yearly"
                        ? "$19.99/month"
                        : "$29.99/month"}
                    </p>
                    <p
                      className={"text-token-text-tertiary text-xs font-light"}
                    >
                      after free trial <br />
                      {billingCycle === "yearly" &&
                        "billed yearly $239.88/year"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-token-main-surface-primary relative flex flex-col">
                <Button
                  onClick={() => sendGTMEvent("click_plan_pro")}
                  formAction={formActionPro}
                  className={"bg-violet-700"}
                  data-testid="select-plan-button-Pros-create"
                >
                  Try Pro for free
                </Button>
              </div>
              <div className="flex grow flex-col gap-2">
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <p className="text-l font-medium">
                    Everything in{" "}
                    <span className="capitalize">{profile?.plan}</span>, and:
                  </p>
                </div>
                <PlanFeature title={"Unlimited GPT-4 Turbo messages"} />
                <PlanFeature
                  title={
                    "Unlimited access to Mistral, Claude, Gemini and LLaMa 2 models"
                  }
                />
                <PlanFeature title={"Unlimited image generations"} />
                <PlanFeature
                  title={"Different rendering models for AI images"}
                />
                <PlanFeature title={"Several images in one request"} />
                <PlanFeature title={"Highest-priority support"} />
                <PlanFeature title={"Advanced privacy and security"} />
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
