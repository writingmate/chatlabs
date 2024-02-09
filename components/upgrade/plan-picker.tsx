import { ChatbotUIContext } from "@/context/context"
import {
  IconAdjustmentsHorizontal,
  IconCheck,
  IconSparkles
} from "@tabler/icons-react"
import { FC, useContext, useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogHeader,
  DialogClose,
  DialogTitle
} from "../ui/dialog"
import { WithTooltip } from "../ui/with-tooltip"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { createCheckoutSession } from "@/actions/stripe"
import { Tables } from "@/supabase/types"
import { supabase } from "@/lib/supabase/browser-client"
import profile from "react-syntax-highlighter/dist/esm/languages/hljs/profile"

interface PlanPickerProps {}

function PlanFeature({ title }: { title: string }) {
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

type WritingmatePlan =
  | "free"
  | "pro_monthly"
  | "pro_yearly"
  | "premium_monthly"
  | "premium_yearly"

export const PlanPicker: FC<PlanPickerProps> = () => {
  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly">(
    "yearly"
  )

  const { isPaywallOpen, setIsPaywallOpen } = useContext(ChatbotUIContext)

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

  const formActionPremium = async (data: FormData) => {
    data.set("plan", "premium_" + data.get("billingCycle"))
    return formAction(data)
  }

  const formActionPro = async (data: FormData) => {
    data.set("plan", "pro_" + data.get("billingCycle"))
    return formAction(data)
  }

  return (
    <Dialog open={isPaywallOpen} onOpenChange={setIsPaywallOpen}>
      <DialogTrigger>
        <WithTooltip
          delayDuration={0}
          side="top"
          display={
            <div>Upgrade to paid plans to get access to all features.</div>
          }
          trigger={
            <IconSparkles
              className="cursor-pointer pt-[4px] text-violet-700 hover:opacity-50"
              size={24}
            />
          }
        />
      </DialogTrigger>
      <DialogContent className={"w-full max-w-4xl"}>
        <form method={"POST"}>
          <input type={"hidden"} value={billingCycle} name={"billingCycle"} />
          <DialogHeader>
            <DialogTitle>Upgrade your plan</DialogTitle>
          </DialogHeader>
          <div>
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
                <PlanFeature title={"Access to GPT-3.5 model"} />
                <PlanFeature title={"30 messages per day limit"} />
                <PlanFeature title={"Access to Writingmate Labs"} />
                <PlanFeature title={"Access to Chrome Extension"} />
              </div>
            </div>
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
                <Button
                  formAction={formActionPremium}
                  className={"bg-violet-700"}
                >
                  Try Premium for free
                </Button>
              </div>
              <div className="flex grow flex-col gap-2">
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <p className="text-l font-medium">Everything in Free, and:</p>
                </div>
                <PlanFeature title={"Unlimited GPT-3.5 queries"} />
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
            <div
              className="border-token-border-light relative flex flex-1 flex-col gap-5 border-t px-6 py-4 text-sm last:border-r-0 md:max-w-xs md:border-r md:border-t-0"
              data-testid="Pro-pricing-modal-column"
            >
              <div className="bg-token-main-surface-primary relative flex flex-col">
                <div className="flex flex-col gap-1">
                  <p className="flex items-center gap-2 text-xl font-medium">
                    <IconSparkles className={"text-black"} />
                    Pro
                  </p>
                  <div className="min-h-[56px] flex-col items-baseline gap-[6px]">
                    <p
                      className="text-token-text-tertiary text-base font-light"
                      data-testid="Pro-pricing-column-cost"
                    >
                      $19.99/month
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
                  formAction={formActionPro}
                  data-testid="select-plan-button-Pros-create"
                >
                  Try Pro for free
                </Button>
              </div>
              <div className="flex grow flex-col gap-2">
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <p className="text-l font-medium">
                    Everything in Premium, and:
                  </p>
                </div>
                <PlanFeature title={"Unlimited GPT-3.5 messages"} />
                <PlanFeature title={"Unlimited GPT-4 Turbo messages"} />
                <PlanFeature
                  title={"Access to Mistral, Claude, Gemini and LLaMa 2 models"}
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
