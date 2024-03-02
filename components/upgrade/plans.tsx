import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { IconSparkles } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { PlanFeature } from "@/components/upgrade/plan-picker"
import { sendGAEvent } from "@next/third-parties/google"
import { useContext, useState } from "react"
import { ChatbotUIContext } from "@/context/context"
import { supabase } from "@/lib/supabase/browser-client"
import { createCheckoutSession } from "@/actions/stripe"

export default function Plans() {
  const { profile } = useContext(ChatbotUIContext)

  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly">(
    "yearly"
  )

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

  const formActionBYOK = async (data: FormData) => {
    data.set("plan", "byok_" + data.get("billingCycle"))
    return formAction(data)
  }

  const formActionPro = async (data: FormData) => {
    data.set("plan", "pro_" + data.get("billingCycle"))
    return formAction(data)
  }

  return (
    <form method={"POST"}>
      <input type={"hidden"} value={billingCycle} name={"billingCycle"} />
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
        <div
          className="border-token-border-light relative flex flex-1 flex-col gap-5 border-t px-6 py-4 text-sm last:border-r-0 md:max-w-xs md:border-r md:border-t-0"
          data-testid="Premium-pricing-modal-column"
        >
          <div className="bg-token-main-surface-primary relative flex flex-col">
            <div className="flex flex-col gap-1">
              <WithTooltip
                side={"top"}
                display={"Bring your own key"}
                trigger={
                  <p className="flex items-center gap-2 text-xl font-medium">
                    <IconSparkles className={"text-violet-700"} />
                    BYOK
                  </p>
                }
              />
              <div className="flex items-baseline gap-[6px]">
                <div className="min-h-[56px] flex-col items-baseline gap-[6px]">
                  <p
                    className="text-token-text-tertiary text-base font-light"
                    data-testid="Pro-pricing-column-cost"
                  >
                    {billingCycle === "yearly" ? "$6.99/month" : "$9.99/month"}
                  </p>
                  <p className={"text-token-text-tertiary text-xs font-light"}>
                    after free trial <br />
                    {billingCycle === "yearly" && "billed yearly $119.88/year"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-token-main-surface-primary relative flex flex-col">
            <Button
              formAction={formActionBYOK}
              className={"bg-violet-700 text-white"}
            >
              Try BYOK for free
            </Button>
          </div>
          <div className="flex grow flex-col gap-2">
            <PlanFeature
              title={
                <>
                  <b>Use your API keys</b>
                  <br /> to access OpenAI,
                  <br /> Mistral, Claude, Gemini, and Perplexity
                </>
              }
            />
            <PlanFeature title={"Access to all AI Assistants"} />
            <PlanFeature title={"AI Image Generation"} />
            <PlanFeature title={"GPT-4 Vision"} />
            <PlanFeature title={"Web Browsing"} />
          </div>
        </div>
        <div
          className="border-token-border-light relative flex flex-1 flex-col gap-5 border-t px-6 py-4 text-sm last:border-r-0 md:max-w-xs md:border-r md:border-t-0"
          data-testid="Pro-pricing-modal-column"
        >
          <div className="bg-token-main-surface-primary relative flex flex-col">
            <div className="flex flex-col gap-1">
              <p className="flex items-center gap-2 text-xl font-medium">
                <IconSparkles className={"text-foreground"} />
                Pro
              </p>
              <div className="min-h-[56px] flex-col items-baseline gap-[6px]">
                <p
                  className="text-token-text-tertiary text-base font-light"
                  data-testid="Pro-pricing-column-cost"
                >
                  {billingCycle === "yearly" ? "$19.99/month" : "$29.99/month"}
                </p>
                <p className={"text-token-text-tertiary text-xs font-light"}>
                  after free trial <br />
                  {billingCycle === "yearly" && "billed yearly $239.88/year"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-token-main-surface-primary relative flex flex-col">
            <Button
              formAction={formActionPro}
              onClick={() =>
                sendGAEvent("event", "click_plan_pro_onboarding", {
                  plan: profile?.plan,
                  userId: profile?.user_id,
                  location: window.location.href
                })
              }
              data-testid="select-plan-button-Pros-create"
            >
              Try Pro for free
            </Button>
          </div>
          <div className="flex grow flex-col gap-2">
            <PlanFeature
              title={
                <>
                  <b>No API keys required.</b>
                  <br /> Unlimited access to OpenAI, Mistral, Claude, Gemini,
                  and Perplexity
                </>
              }
            />
            <PlanFeature title={"Access to all AI Assistants"} />
            <PlanFeature title={"GPT-4 Vision"} />
            <PlanFeature title={"AI Image Generation"} />
            <PlanFeature title={"Web Browsing"} />
          </div>
        </div>
      </div>
    </form>
  )
}
