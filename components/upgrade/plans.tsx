import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { WithTooltip } from "@/components/ui/with-tooltip"
import {
  IconX,
  IconSparkles,
  IconKey,
  IconRobot,
  IconLayout2,
  IconBooks,
  IconFileDescription,
  IconGlobe,
  IconPhoto,
  IconShield
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { PlanFeature } from "@/components/upgrade/plan-picker"
import { useContext, useState } from "react"
import { ChatbotUIContext } from "@/context/context"
import { supabase } from "@/lib/supabase/browser-client"
import { createCheckoutSession } from "@/actions/stripe"
import { router } from "next/client"
import { Badge } from "@/components/ui/badge"

const BYOK_PLAN_PREFIX = "byok"
const PRO_PLAN_PREFIX = "pro"
const BILLING_CYCLE_YEARLY = "yearly"
const BILLING_CYCLE_MONTHLY = "monthly"

type BILLING_CYCLE = typeof BILLING_CYCLE_YEARLY | typeof BILLING_CYCLE_MONTHLY

interface PlansProps {
  onClose: () => void
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

  const closeDialog = () => {
    setIsDialogVisible(false)
    onClose()
  }

  const FeatureGroup = ({
    icon,
    title,
    children
  }: {
    icon: React.ReactNode
    title: string
    children: React.ReactNode
  }) => (
    <div className="mb-2">
      <div className="mb-2 flex items-center">
        {icon}
        <span className="ml-2 font-semibold">{title}</span>
      </div>
      {children}
    </div>
  )

  return (
    <>
      <div
        className={`dialog-container ${isDialogVisible ? "visible" : "hidden"} relative`}
      >
        <div className="absolute right-0 top-4">
          {showCloseIcon && (
            <button onClick={closeDialog}>
              <IconX size={24} />
            </button>
          )}
        </div>
        <div className="my-2">
          <form method={"POST"}>
            <input type={"hidden"} value={billingCycle} name={"billingCycle"} />
            <div className="mx-auto my-2 flex justify-center">
              <ToggleGroup
                type={"single"}
                className={"w-2/3 sm:translate-x-11"}
                value={billingCycle}
                onValueChange={value =>
                  setBillingCycle(value as "yearly" | "monthly")
                }
              >
                <ToggleGroupItem value={BILLING_CYCLE_MONTHLY}>
                  Monthly
                </ToggleGroupItem>
                <ToggleGroupItem value={BILLING_CYCLE_YEARLY}>
                  Yearly
                  <span className="ml-2 line-clamp-1 text-nowrap rounded bg-green-500 px-2 py-1 text-xs text-white">
                    4 months free
                  </span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex flex-col-reverse md:flex-row">
              <div
                className="border-token-border-light relative flex flex-1 flex-col gap-5 border-t p-4 text-sm last:border-r-0 md:max-w-xs md:border-r md:border-t-0"
                data-testid="BYOK-pricing-modal-column"
              >
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <div className="flex flex-col gap-1">
                    <p className="text-xl font-semibold">
                      Bring Your Keys Plan
                    </p>
                    <p className="text-foreground/60 mb-4 text-sm">
                      Connect your API keys to access AI models and all features
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-semibold">
                        ${billingCycle === "yearly" ? "6.99" : "9.99"}
                      </p>
                      {billingCycle === "yearly" && (
                        <p className="text-foreground/50 line-through">$9.99</p>
                      )}
                    </div>
                    <p className="text-foreground/50 text-sm">
                      {billingCycle === "yearly"
                        ? "per month, billed annually ($83.88/year)"
                        : "per month"}
                    </p>
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
                  <FeatureGroup
                    icon={<IconKey size={20} />}
                    title="API Key Access"
                  >
                    <PlanFeature title="Access to all Professional Plan features with the AI models for which you have API keys" />
                    <PlanFeature title="Connect keys for GPT-4o, Mistral, Claude 3, Gemini Pro, LLama 3, Perplexity, Groq, and other models" />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconShield size={20} />}
                    title="Privacy and Security"
                  >
                    <PlanFeature title="Conversations and search results are private" />
                    <PlanFeature title="Generated images are private" />
                  </FeatureGroup>
                </div>
              </div>
              <div
                className="border-token-border-light relative flex flex-1 flex-col gap-5 border-t p-4 text-sm last:border-r-0 md:max-w-xs md:border-r md:border-t-0"
                data-testid="Pro-pricing-modal-column"
              >
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <div className="flex flex-col gap-1">
                    <p className="flex items-center space-x-2 text-xl font-semibold">
                      <span>Professional Plan</span>{" "}
                      <Badge variant={"outline"}>Popular</Badge>
                    </p>
                    <p className="text-foreground/60 mb-4 text-sm">
                      Unlimited access to all models and features. No API keys
                      required
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-semibold">
                        ${billingCycle === "yearly" ? "19.99" : "29.99"}
                      </p>
                      {billingCycle === "yearly" && (
                        <p className="text-foreground/50 line-through">
                          $29.99
                        </p>
                      )}
                    </div>
                    <p className="text-foreground/50 text-sm">
                      {billingCycle === "yearly"
                        ? "per month, billed annually ($239.88/year)"
                        : "per month"}
                    </p>
                  </div>
                </div>
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <Button
                    disabled={loading !== "" && loading !== PRO_PLAN_PREFIX}
                    loading={loading === PRO_PLAN_PREFIX}
                    formAction={createFormAction(PRO_PLAN_PREFIX)}
                    onClick={() => handleClick(PRO_PLAN_PREFIX)}
                    data-testid="select-plan-button-Pro-create"
                    className={"bg-violet-700 text-white"}
                  >
                    Upgrade now
                  </Button>
                </div>
                <div className="flex grow flex-col gap-2">
                  <FeatureGroup
                    icon={<IconRobot size={20} />}
                    title="AI Models"
                  >
                    <PlanFeature title="Access to all 30+ AI models" />
                    <PlanFeature title="Including GPT-4o, Mistral, Claude 3.5, Gemini Pro, LLama 3, Perplexity, Groq" />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconShield size={20} />}
                    title="Privacy and Security"
                  >
                    <PlanFeature title="Conversations and search results are private" />
                    <PlanFeature title="Generated images are private" />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconPhoto size={20} />}
                    title="Image Generation"
                  >
                    <PlanFeature title="Generate detailed visuals for work, study, and presentations with DALL-E 3 and Stable Diffusion 3" />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconGlobe size={20} />}
                    title="Web Access"
                  >
                    <PlanFeature title="Quickly access the latest research and online data" />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconFileDescription size={20} />}
                    title="File Chat"
                  >
                    <PlanFeature title="Upload documents to extract or summarize key information directly" />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconSparkles size={20} />}
                    title="AI Assistants"
                  >
                    <PlanFeature title="Get personalized help with pre-built and custom GPT assistants and create yours" />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconLayout2 size={20} />}
                    title="Model Comparison"
                  >
                    <PlanFeature title="Compare models based on quality, speed, cost, and the number of tokens used" />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconBooks size={20} />}
                    title="Prompt Library"
                  >
                    <PlanFeature title="A wide range of prompts to enhance interactions with AI and save your time" />
                  </FeatureGroup>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
