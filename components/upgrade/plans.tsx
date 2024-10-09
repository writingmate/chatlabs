import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
import { useContext, useState, useRef, useEffect, useCallback } from "react"
import { ChatbotUIContext } from "@/context/context"
import { supabase } from "@/lib/supabase/browser-client"
import { createCheckoutSession } from "@/actions/stripe"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

  const handleBillingCycleChange = (value: string) => {
    if (value === BILLING_CYCLE_YEARLY || value === BILLING_CYCLE_MONTHLY) {
      setBillingCycle(value)
    } else {
      console.error("Invalid billing cycle selected:", value)
      setBillingCycle(BILLING_CYCLE_YEARLY)
    }
  }

  const [loading, setLoading] = useState("")
  const [isDialogVisible, setIsDialogVisible] = useState(true)
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false)

  const formAction = async (data: FormData): Promise<void> => {
    try {
      const user = (await supabase.auth.getUser()).data.user

      if (!user) {
        return window.location.assign("/login")
      }

      data.set("email", user?.email as string)
      data.set("userId", user?.id)

      const { url } = await createCheckoutSession(data)

      window.location.assign(url as string)
    } catch (error) {
      setLoading("")
      toast.error(
        "Failed to upgrade plan. Something went wrong. Please try again."
      )
      console.error(error)
    }
  }

  function createFormAction(plan_prefix: string) {
    return (data: FormData) => {
      const plan = `${plan_prefix}_${billingCycle}`
      console.log("Selected plan:", plan)
      data.set("plan", plan)
      return formAction(data)
    }
  }

  const handleClick = useCallback(
    (plan: string) => {
      const event = `click_${plan}_${billingCycle}`
      window.gtag?.("event", event)
      window.dataLayer?.push({ event })
      setLoading(plan)
    },
    [billingCycle]
  )

  const closeDialog = useCallback(() => {
    setIsDialogVisible(false)
    onClose()
  }, [onClose])

  const toggleCollapsible = useCallback(() => {
    setIsCollapsibleOpen(prev => !prev)
  }, [])

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

  const { t } = useTranslation()

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
                type="single"
                className="w-auto rounded-full bg-gray-200 p-1"
                value={billingCycle}
                onValueChange={handleBillingCycleChange}
              >
                <ToggleGroupItem
                  value={BILLING_CYCLE_MONTHLY}
                  className={`rounded-full px-4 py-2 transition-all duration-200 ${
                    billingCycle === BILLING_CYCLE_MONTHLY
                      ? "bg-violet-700 text-white shadow-lg"
                      : "bg-transparent text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t("Monthly")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={BILLING_CYCLE_YEARLY}
                  className={`rounded-full px-4 py-2 transition-all duration-200 ${
                    billingCycle === BILLING_CYCLE_YEARLY
                      ? "bg-violet-700 text-white shadow-lg"
                      : "bg-transparent text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t("Yearly")}
                  <span className="ml-2 line-clamp-1 text-nowrap rounded bg-green-500 px-2 py-1 text-xs text-white">
                    {t("2 months free")}
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
                    <p className="text-xl font-semibold">One for All Plan</p>
                    <p className="text-foreground/60 mb-4 text-sm">
                      {t(
                        "Connect your API keys to access AI models and all platform features"
                      )}
                    </p>
                    <a
                      href="/tutorial" // Replace with the actual tutorial URL
                      className="mb-4 text-sm font-medium text-blue-500 underline transition-colors duration-200 hover:text-blue-600"
                    >
                      {t(
                        "One key for all AI models. Click here to see the tutorial"
                      )}
                    </a>
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
                    {t("Upgrade NOW")}
                  </Button>
                </div>
                <div className="flex grow flex-col gap-2">
                  <FeatureGroup
                    icon={<IconKey size={20} />}
                    title={t("API Key Hub")}
                  >
                    <PlanFeature
                      title={t(
                        "Fully optimized for openrouter API. No VPN and overseas credit card required"
                      )}
                    />
                    <PlanFeature
                      title={t(
                        "Use all AI models and features with your own API keys in one powerful platform"
                      )}
                    />
                    <PlanFeature
                      title={t(
                        "Connect keys for OpenAI, Anthropic, Perplexity, Groq, and other providers"
                      )}
                    />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconRobot size={20} />}
                    title={t("PRO Models")}
                  >
                    <PlanFeature
                      title={t("Access to PRO models at the first moment")}
                    />
                    <PlanFeature
                      title={t(
                        "Including Newest OpenAI: o1, o1mini, GPT-4o, Claude 3.5, Gemini Pro and other opensource models"
                      )}
                    />
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
                      <span>{t("Professional Plan")}</span>
                      <Badge variant={"outline"}>{t("Popular")}</Badge>
                    </p>
                    <p className="text-foreground/60 mb-4 text-sm">
                      {t("We take care of the rest")}
                    </p>
                    <p className="text-foreground/60 mb-4 text-sm">
                      {t("Unlimited access")}
                    </p>
                    <p className="text-foreground/60 mb-4 text-sm">
                      {t("No API keys required")}
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
                    className={
                      "bg-violet-700 text-white hover:bg-white hover:text-violet-700 hover:outline hover:outline-violet-700"
                    }
                  >
                    {t("Upgrade NOW")}
                  </Button>
                </div>
                <div className="flex grow flex-col gap-2">
                  <FeatureGroup
                    icon={<IconRobot size={20} />}
                    title={t("AI Models")}
                  >
                    <PlanFeature title={t("Access to all 30+ AI models")} />
                    <PlanFeature
                      title={t(
                        "Now supporting OpenAI: o1mini, GPT-4o, Claude 3.5 and more"
                      )}
                    />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconPhoto size={20} />}
                    title={t("Image Generation")}
                  >
                    <PlanFeature
                      title={t(
                        "Generate detailed visuals for work, study, and presentations with newest Flux1.pro and Stable Diffusion 3"
                      )}
                    />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconGlobe size={20} />}
                    title={t("Web Access")}
                  >
                    <PlanFeature
                      title={t(
                        "Quickly access online data and form research report（Beta）"
                      )}
                    />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconFileDescription size={20} />}
                    title={t("File Chat")}
                  >
                    <PlanFeature
                      title={t(
                        "Upload documents to extract or summarize key information directly"
                      )}
                    />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconSparkles size={20} />}
                    title={t("AI Assistants")}
                  >
                    <PlanFeature
                      title={t(
                        "Get personalized help with pre-built and custom GPT assistants and create yours"
                      )}
                    />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconLayout2 size={20} />}
                    title={t("Model Comparison")}
                  >
                    <PlanFeature
                      title={t(
                        "Compare models based on quality, speed, cost, and the number of tokens used"
                      )}
                    />
                  </FeatureGroup>
                  <FeatureGroup
                    icon={<IconBooks size={20} />}
                    title={t("Prompt Library")}
                  >
                    <PlanFeature
                      title={t(
                        "A wide range of prompts to enhance interactions with AI and save your time"
                      )}
                    />
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
