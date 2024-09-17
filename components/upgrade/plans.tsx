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
  IconCircleDashed,
  IconGlobe,
  IconPhoto,
  IconShield
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { PlanFeature } from "@/components/upgrade/plan-picker"
import { useContext, useState, useRef, useEffect } from "react"
import { ChatbotUIContext } from "@/context/context"
import { supabase } from "@/lib/supabase/browser-client"
import { createCheckoutSession } from "@/actions/stripe"
import { router } from "next/client"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const BYOK_PLAN_PREFIX = "byok"
const PRO_PLAN_PREFIX = "pro"
const ULTIMATE_PLAN_PREFIX = "ultimate"
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
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false)

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

  const toggleCollapsible = () => {
    setIsCollapsibleOpen(prev => !prev)
  }

  const FeatureGroup = ({
    icon,
    className,
    title,
    children
  }: {
    icon: React.ReactNode
    className?: string
    title: string
    children: React.ReactNode
  }) => (
    <div className={cn("mb-2", className)}>
      <div className="mb-2 flex items-center">
        {icon}
        <span className="ml-2 font-semibold">{title}</span>
      </div>
      {children}
    </div>
  )

  const CollapsibleFeatures = ({ children }: { children: React.ReactNode }) => {
    return (
      <Collapsible open={isCollapsibleOpen} onOpenChange={toggleCollapsible}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="text-foreground/60 text-xs font-normal">
            See all features
          </span>
          <motion.div
            initial={false}
            animate={{ rotate: isCollapsibleOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="text-foreground/60 size-4" />
          </motion.div>
        </CollapsibleTrigger>
        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    )
  }

  const getCurrentPlan = () => {
    if (!profile?.plan) return "free"
    if (profile.plan.startsWith("pro_")) return "pro"
    if (profile.plan.startsWith("ultimate_")) return "ultimate"
    return "free"
  }

  const currentPlan = getCurrentPlan()

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
              {/* Pro Plan */}
              <div
                className="border-token-border-light relative flex flex-1 flex-col gap-5 border-t p-4 text-sm last:border-r-0 sm:pl-0 md:max-w-xs md:border-r md:border-t-0"
                data-testid="Pro-pricing-modal-column"
              >
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <div className="flex flex-col gap-1">
                    <p className="flex items-center space-x-2 text-xl font-semibold">
                      <span>Professional Plan</span>{" "}
                      <Badge variant={"outline"}>Popular</Badge>
                    </p>
                    <p className="text-foreground/60 mb-4 text-sm">
                      Access to most of the models and features. Suitable for
                      most users.
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
                    <p className="text-foreground/50 text-xs">
                      {billingCycle === "yearly"
                        ? "per month, billed annually ($239.88/year)"
                        : "per month"}
                    </p>
                  </div>
                </div>
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  {currentPlan === "free" ? (
                    <Button
                      disabled={loading !== "" && loading !== PRO_PLAN_PREFIX}
                      loading={loading === PRO_PLAN_PREFIX}
                      formAction={createFormAction(PRO_PLAN_PREFIX)}
                      onClick={() => handleClick(PRO_PLAN_PREFIX)}
                      data-testid="select-plan-button-Pro-create"
                      className={
                        "bg-violet-700 text-white hover:bg-white hover:text-violet-700 hover:outline hover:outline-violet-700"
                      }
                    >
                      Upgrade now
                    </Button>
                  ) : currentPlan === "pro" ? (
                    <Button disabled className="bg-gray-300 text-gray-600">
                      Current Plan
                    </Button>
                  ) : (
                    <Button disabled className="bg-gray-300 text-gray-600">
                      Included in Ultimate
                    </Button>
                  )}
                </div>
                <div className="flex grow flex-col gap-2">
                  <FeatureGroup
                    icon={<IconRobot size={20} />}
                    title="AI Models"
                    className="sm:h-[170px]"
                  >
                    <PlanFeature
                      icon={<IconCircleDashed size={18} />}
                      title="5 messages/day for Claude Opus and OpenAI O1 model"
                    />
                    <PlanFeature
                      icon={<IconCircleDashed size={18} />}
                      title="DALLE-3, Stable Diffusion 3 image models"
                    />
                    <PlanFeature title="Access to GPT-4o, Claude 3.5, Perplexity, Google Gemini, Mistral, LLama 3.1 and 20+ other models" />
                  </FeatureGroup>
                  <CollapsibleFeatures>
                    <FeatureGroup
                      icon={<IconLayout2 size={20} />}
                      title="Model Comparison"
                    >
                      <PlanFeature title="Compare models based on quality, speed, cost, and the number of tokens used" />
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
                      icon={<IconBooks size={20} />}
                      title="Prompt Library"
                    >
                      <PlanFeature title="A wide range of prompts to enhance interactions with AI and save your time" />
                    </FeatureGroup>
                    <FeatureGroup
                      icon={<IconShield size={20} />}
                      title="Privacy and Security"
                    >
                      <PlanFeature title="Conversations and search results are private" />
                      <PlanFeature title="Generated images are private" />
                    </FeatureGroup>
                  </CollapsibleFeatures>
                </div>
              </div>
              {/* Ultimate Plan */}
              <div
                className="border-token-border-light relative flex flex-1 flex-col gap-5 border-t p-4 text-sm last:border-r-0 sm:pr-0 md:max-w-xs md:border-r md:border-t-0"
                data-testid="Ultimate-pricing-modal-column"
              >
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  <div className="flex flex-col gap-1">
                    <p className="text-xl font-semibold">Ultimate Plan</p>
                    <p className="text-foreground/60 mb-4 text-sm">
                      Access to the most advanced models. For the ultimate AI
                      users.
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-semibold">
                        ${billingCycle === "yearly" ? "39.99" : "59.99"}
                      </p>
                      {billingCycle === "yearly" && (
                        <p className="text-foreground/50 line-through">
                          $59.99
                        </p>
                      )}
                    </div>
                    <p className="text-foreground/50 text-xs">
                      {billingCycle === "yearly"
                        ? "per month, billed annually ($479.88/year)"
                        : "per month"}
                    </p>
                  </div>
                </div>
                <div className="bg-token-main-surface-primary relative flex flex-col">
                  {currentPlan === "free" || currentPlan === "pro" ? (
                    <Button
                      variant={currentPlan === "pro" ? "default" : "outline"}
                      disabled={
                        loading !== "" && loading !== ULTIMATE_PLAN_PREFIX
                      }
                      loading={loading === ULTIMATE_PLAN_PREFIX}
                      formAction={createFormAction(ULTIMATE_PLAN_PREFIX)}
                      onClick={() => handleClick(ULTIMATE_PLAN_PREFIX)}
                      className={
                        currentPlan === "pro"
                          ? "bg-violet-700 text-white hover:bg-white hover:text-violet-700 hover:outline hover:outline-violet-700"
                          : "border border-violet-700 text-violet-700 hover:bg-violet-700 hover:text-white"
                      }
                    >
                      {currentPlan === "pro"
                        ? "Upgrade to Ultimate"
                        : "Upgrade now"}
                    </Button>
                  ) : (
                    <Button disabled className="bg-gray-300 text-gray-600">
                      Current Plan
                    </Button>
                  )}
                </div>
                <div className="flex grow flex-col gap-2">
                  <FeatureGroup
                    icon={<IconRobot size={20} />}
                    title="AI Models"
                    className="sm:h-[170px]"
                  >
                    <PlanFeature title="50 messages/day for Claude 3 Opus and OpenAI O1 model" />
                    <PlanFeature title="FLUX.Pro, DALLE-3, Stable Diffusion 3 image models" />
                    <PlanFeature title="All Pro plan models" />
                  </FeatureGroup>
                  <CollapsibleFeatures>
                    <FeatureGroup
                      icon={<IconLayout2 size={20} />}
                      title="Model Comparison"
                    >
                      <PlanFeature title="Compare models based on quality, speed, cost, and the number of tokens used" />
                    </FeatureGroup>

                    <FeatureGroup
                      icon={<IconPhoto size={20} />}
                      title="Image Generation"
                    >
                      <PlanFeature title="Generate detailed visuals for work, study, and presentations with FLUX.Pro, DALL-E 3 and Stable Diffusion 3" />
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
                      icon={<IconBooks size={20} />}
                      title="Prompt Library"
                    >
                      <PlanFeature title="A wide range of prompts to enhance interactions with AI and save your time" />
                    </FeatureGroup>
                    <FeatureGroup
                      icon={<IconShield size={20} />}
                      title="Privacy and Security"
                    >
                      <PlanFeature title="Conversations and search results are private" />
                      <PlanFeature title="Generated images are private" />
                    </FeatureGroup>
                  </CollapsibleFeatures>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
