import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { IconX, IconSparkles } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { PlanFeature } from "@/components/upgrade/plan-picker"
import { useContext, useState } from "react"
import { ChatbotUIContext } from "@/context/context"
import { supabase } from "@/lib/supabase/browser-client"
import { createCheckoutSession } from "@/actions/stripe"
import { router } from "next/client"

const BYOK_PLAN_PREFIX = "byok"
const PRO_PLAN_PREFIX = "pro"
const BILLING_CYCLE_YEARLY = "yearly"
const BILLING_CYCLE_MONTHLY = "monthly"

type BILLING_CYCLE = typeof BILLING_CYCLE_YEARLY | typeof BILLING_CYCLE_MONTHLY

interface PlansProps {
  onClose: () => void // Function to close the dialog
  showCloseIcon: boolean
}
export default function Plans({ onClose, showCloseIcon }: PlansProps) {
  const { profile } = useContext(ChatbotUIContext)

  const [billingCycle, setBillingCycle] =
    useState<BILLING_CYCLE>(BILLING_CYCLE_YEARLY)

  const [loading, setLoading] = useState("")
  const [isDialogVisible, setIsDialogVisible] = useState(true)

  const formAction = async (data: FormData): Promise<void> => {
    const user = (await supabase.auth.getUser()).data.user

    if (!user) {
      return window.location.assign("/login")
    }

    data.set("email", user?.email as string)
    data.set("userId", user?.id)

    const { url } = await createCheckoutSession(data)

    window.location.assign(url as string)
  }

  function createFormAction(plan_prefix: string) {
    return (data: FormData) => {
      const plan = `${plan_prefix}_${billingCycle}`
      data.set("plan", plan)
      return formAction(data)
    }
  }

  const handleClick = (plan: string) => {
    const event = `click_${plan}_${billingCycle}`
    window.gtag?.("event", event)
    window.dataLayer?.push({ event })
    setLoading(plan)
  }

  // Function to close the dialog
  const closeDialog = () => {
    setIsDialogVisible(false)
    onClose()
  }

  return (
    <>
      <div
        className={`dialog-container ${isDialogVisible ? "visible" : "hidden"} relative`}
      >
        <div className="absolute right-0 top-0 p-2">
          {showCloseIcon && (
            <button onClick={closeDialog} className="p-2">
              <IconX size={24} />
            </button>
          )}
        </div>
        <div className="my-2">
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
                <ToggleGroupItem value={BILLING_CYCLE_YEARLY}>
                  Yearly
                </ToggleGroupItem>
                <ToggleGroupItem value={BILLING_CYCLE_MONTHLY}>
                  Monthly
                </ToggleGroupItem>
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
                          {billingCycle === "yearly"
                            ? "$6.99/month"
                            : "$9.99/month"}
                        </p>
                        <p
                          className={
                            "text-token-text-tertiary text-xs font-light"
                          }
                        >
                          {billingCycle === "yearly" &&
                            "billed yearly $83.88/year"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <Button
                    disabled={loading !== "" && loading !== BYOK_PLAN_PREFIX}
                    loading={loading === BYOK_PLAN_PREFIX}
                    formAction={createFormAction(BYOK_PLAN_PREFIX)}
                    onClick={() => handleClick(BYOK_PLAN_PREFIX)}
                    className={"bg-violet-700 text-white"}
                  >
                    Upgrade now
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
                      <IconSparkles className={"text-violet-700"} />
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
                        className={
                          "text-token-text-tertiary text-xs font-light"
                        }
                      >
                        {billingCycle === "yearly" &&
                          "billed yearly $239.88/year"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <Button
                    disabled={loading !== "" && loading !== PRO_PLAN_PREFIX}
                    loading={loading === PRO_PLAN_PREFIX}
                    formAction={createFormAction(PRO_PLAN_PREFIX)}
                    onClick={() => handleClick(PRO_PLAN_PREFIX)}
                    data-testid="select-plan-button-Pros-create"
                    className={"bg-violet-700 text-white"}
                  >
                    Upgrade now
                  </Button>
                </div>
                <div className="flex grow flex-col gap-2">
                  <PlanFeature
                    title={
                      <>
                        <b>No API keys required.</b>
                        <br /> Unlimited access to OpenAI, Mistral, Claude,
                        Gemini, and Perplexity
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
        </div>
      </div>
    </>
  )
}
