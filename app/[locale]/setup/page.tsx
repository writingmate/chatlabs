"use client"

import { ChatbotUIContext } from "@/context/context"
import { getProfileByUserId, updateProfile } from "@/db/profile"
import {
  getHomeWorkspaceByUserId,
  getWorkspacesByUserId
} from "@/db/workspaces"
import {
  fetchHostedModels,
  fetchOpenRouterModels
} from "@/lib/models/fetch-models"
import { supabase } from "@/lib/supabase/browser-client"
import { TablesUpdate } from "@/supabase/types"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { FinishStep } from "@/components/setup/finish-step"
import { ProfileStep } from "@/components/setup/profile-step"
import {
  SETUP_STEP_COUNT,
  StepContainer
} from "@/components/setup/step-container"
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IconSparkles, IconX } from "@tabler/icons-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { sendGTMEvent } from "@next/third-parties/google"
import { useTheme } from "next-themes"
import { PlanFeature } from "@/components/upgrade/plan-picker"

export default function SetupPage() {
  const {
    profile,
    setProfile,
    setWorkspaces,
    setSelectedWorkspace,
    setEnvKeyMap,
    setAvailableHostedModels,
    setAvailableOpenRouterModels
  } = useContext(ChatbotUIContext)

  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [currentStep, setCurrentStep] = useState(1)

  // Profile Step
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState(profile?.username || "")
  const [usernameAvailable, setUsernameAvailable] = useState(true)

  // API Step
  const [useAzureOpenai, setUseAzureOpenai] = useState(false)
  const [openaiAPIKey, setOpenaiAPIKey] = useState("")
  const [openaiOrgID, setOpenaiOrgID] = useState("")
  const [azureOpenaiAPIKey, setAzureOpenaiAPIKey] = useState("")
  const [azureOpenaiEndpoint, setAzureOpenaiEndpoint] = useState("")
  const [azureOpenai35TurboID, setAzureOpenai35TurboID] = useState("")
  const [azureOpenai45TurboID, setAzureOpenai45TurboID] = useState("")
  const [azureOpenai45VisionID, setAzureOpenai45VisionID] = useState("")
  const [azureOpenaiEmbeddingsID, setAzureOpenaiEmbeddingsID] = useState("")
  const [anthropicAPIKey, setAnthropicAPIKey] = useState("")
  const [googleGeminiAPIKey, setGoogleGeminiAPIKey] = useState("")
  const [mistralAPIKey, setMistralAPIKey] = useState("")
  const [perplexityAPIKey, setPerplexityAPIKey] = useState("")
  const [openrouterAPIKey, setOpenrouterAPIKey] = useState("")
  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly">(
    "yearly"
  )

  const { theme } = useTheme()

  useEffect(() => {
    ;(async () => {
      const session = (await supabase.auth.getSession()).data.session

      if (!session) {
        return router.push("/login")
      } else {
        const user = session.user

        const profile = await getProfileByUserId(user.id)
        setProfile(profile)
        setUsername(profile.username)

        if (!profile.has_onboarded) {
          setLoading(false)
        } else {
          const data = await fetchHostedModels(profile)

          if (!data) return

          setEnvKeyMap(data.envKeyMap)
          setAvailableHostedModels(data.hostedModels)

          if (profile["openrouter_api_key"] || data.envKeyMap["openrouter"]) {
            const openRouterModels = await fetchOpenRouterModels()
            if (!openRouterModels) return
            setAvailableOpenRouterModels(openRouterModels)
          }

          const homeWorkspaceId = await getHomeWorkspaceByUserId(
            session.user.id
          )
          return router.push(`/${homeWorkspaceId}/chat`)
        }
      }
    })()
  }, [])

  const handleShouldProceed = (proceed: boolean) => {
    if (proceed) {
      if (currentStep === SETUP_STEP_COUNT) {
        handleSaveSetupSetting()
      } else {
        setCurrentStep(currentStep + 1)
      }
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveSetupSetting = async () => {
    const session = (await supabase.auth.getSession()).data.session
    if (!session) {
      return router.push("/login")
    }

    const user = session.user
    const profile = await getProfileByUserId(user.id)

    const updateProfilePayload: TablesUpdate<"profiles"> = {
      ...profile,
      has_onboarded: true,
      display_name: displayName,
      username,
      openai_api_key: openaiAPIKey,
      openai_organization_id: openaiOrgID,
      anthropic_api_key: anthropicAPIKey,
      google_gemini_api_key: googleGeminiAPIKey,
      mistral_api_key: mistralAPIKey,
      perplexity_api_key: perplexityAPIKey,
      openrouter_api_key: openrouterAPIKey,
      use_azure_openai: useAzureOpenai,
      azure_openai_api_key: azureOpenaiAPIKey,
      azure_openai_endpoint: azureOpenaiEndpoint,
      azure_openai_35_turbo_id: azureOpenai35TurboID,
      azure_openai_45_turbo_id: azureOpenai45TurboID,
      azure_openai_45_vision_id: azureOpenai45VisionID,
      azure_openai_embeddings_id: azureOpenaiEmbeddingsID
    }

    const updatedProfile = await updateProfile(profile.id, updateProfilePayload)
    setProfile(updatedProfile)

    const workspaces = await getWorkspacesByUserId(profile.user_id)
    const homeWorkspace = workspaces.find(w => w.is_home)

    // There will always be a home workspace
    setSelectedWorkspace(homeWorkspace!)
    setWorkspaces(workspaces)

    return router.push(`/${homeWorkspace?.id}/chat`)
  }

  const renderStep = (stepNum: number) => {
    switch (stepNum) {
      // Profile Step
      case 1:
        return (
          <StepContainer
            stepDescription="Let's create your profile."
            stepNum={currentStep}
            stepTitle="Welcome to ChatLabs"
            onShouldProceed={handleShouldProceed}
            showNextButton={!!(username && usernameAvailable)}
            showBackButton={false}
          >
            <ProfileStep
              username={username}
              usernameAvailable={usernameAvailable}
              displayName={displayName}
              onUsernameAvailableChange={setUsernameAvailable}
              onUsernameChange={setUsername}
              onDisplayNameChange={setDisplayName}
            />
          </StepContainer>
        )

      case 2:
        return (
          <StepContainer
            stepDescription="Pro plan gives unlimited access to over 20 AI models."
            stepNum={currentStep}
            stepTitle="Choose your plan"
            onShouldProceed={handleShouldProceed}
            showNextButton={true}
            showBackButton={true}
          >
            <form method={"POST"}>
              <input
                type={"hidden"}
                value={billingCycle}
                name={"billingCycle"}
              />
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
                {/*{profile?.plan.startsWith("premium_") && (*/}
                {/*  <div*/}
                {/*    className="border-token-border-light relative flex flex-1 flex-col gap-5 border-t px-6 py-4 text-sm last:border-r-0 md:max-w-xs md:border-r md:border-t-0"*/}
                {/*    data-testid="Premium-pricing-modal-column"*/}
                {/*  >*/}
                {/*    <div className="bg-token-main-surface-primary relative flex flex-col">*/}
                {/*      <div className="flex flex-col gap-1">*/}
                {/*        <p className="flex items-center gap-2 text-xl font-medium">*/}
                {/*          <IconSparkles className={"text-violet-700"}/>*/}
                {/*          Premium*/}
                {/*        </p>*/}
                {/*        <div className="flex items-baseline gap-[6px]">*/}
                {/*          <div className="min-h-[56px] flex-col items-baseline gap-[6px]">*/}
                {/*            <p*/}
                {/*              className="text-token-text-tertiary text-base font-light"*/}
                {/*              data-testid="Pro-pricing-column-cost"*/}
                {/*            >*/}
                {/*              {billingCycle === "yearly"*/}
                {/*                ? "$9.99/month"*/}
                {/*                : "$14.99/year"}*/}
                {/*            </p>*/}
                {/*            <p*/}
                {/*              className={*/}
                {/*                "text-token-text-tertiary text-xs font-light"*/}
                {/*              }*/}
                {/*            >*/}
                {/*              after free trial <br/>*/}
                {/*              {billingCycle === "yearly" &&*/}
                {/*                "billed yearly $119.88/year"}*/}
                {/*            </p>*/}
                {/*          </div>*/}
                {/*        </div>*/}
                {/*      </div>*/}
                {/*    </div>*/}
                {/*    <div className="bg-token-main-surface-primary relative flex flex-col">*/}
                {/*      <Button disabled={true}>Your current plan</Button>*/}
                {/*    </div>*/}
                {/*    <div className="flex grow flex-col gap-2">*/}
                {/*      <div className="bg-token-main-surface-primary relative flex flex-col">*/}
                {/*        <p className="text-l font-medium">*/}
                {/*          Everything in {profile?.plan}, and:*/}
                {/*        </p>*/}
                {/*      </div>*/}
                {/*      <PlanFeature title={"Unlimited GPT-3.5 messages"}/>*/}
                {/*      <PlanFeature*/}
                {/*        title={"150 queries per month for Image generation"}*/}
                {/*      />*/}
                {/*      <PlanFeature title={"300 queries per month for Web Chat"}/>*/}
                {/*      <PlanFeature*/}
                {/*        title={*/}
                {/*          "Summarize, explain, translate, extract information from any web page"*/}
                {/*        }*/}
                {/*      />*/}
                {/*      <PlanFeature title={"Priority feature requests"}/>*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*)}*/}
                <div
                  className="border-token-border-light relative flex flex-1 flex-col gap-5 border-t px-6 py-4 text-sm last:border-r-0 md:max-w-xs md:border-r md:border-t-0"
                  data-testid="Pro-pricing-modal-column"
                >
                  <div className="bg-token-main-surface-primary relative flex flex-col">
                    <div className="flex flex-col gap-1">
                      <p className="flex items-center gap-2 text-xl font-medium">
                        <IconSparkles
                          className={
                            theme === "dark" ? "text-white" : "text-black"
                          }
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
                          className={
                            "text-token-text-tertiary text-xs font-light"
                          }
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
                      onClick={() => sendGTMEvent("click_plan_pro_onboarding")}
                      // formAction={formActionPro}
                      className={"bg-violet-700"}
                      data-testid="select-plan-button-Pros-create"
                    >
                      Try Pro for free
                    </Button>
                  </div>
                  <div className="flex grow flex-col gap-2">
                    <div className="bg-token-main-surface-primary relative flex flex-col">
                      <p className="text-l font-medium">
                        Everything in <span className="capitalize">Free</span>,
                        and:
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
          </StepContainer>
        )

      // API Step
      // case 2:
      //   return (
      //     <StepContainer
      //       stepDescription="Enter API keys for each service you'd like to use."
      //       stepNum={currentStep}
      //       stepTitle="Set API Keys (optional)"
      //       onShouldProceed={handleShouldProceed}
      //       showNextButton={true}
      //       showBackButton={true}
      //     >
      //       <APIStep
      //         openaiAPIKey={openaiAPIKey}
      //         openaiOrgID={openaiOrgID}
      //         azureOpenaiAPIKey={azureOpenaiAPIKey}
      //         azureOpenaiEndpoint={azureOpenaiEndpoint}
      //         azureOpenai35TurboID={azureOpenai35TurboID}
      //         azureOpenai45TurboID={azureOpenai45TurboID}
      //         azureOpenai45VisionID={azureOpenai45VisionID}
      //         azureOpenaiEmbeddingsID={azureOpenaiEmbeddingsID}
      //         anthropicAPIKey={anthropicAPIKey}
      //         googleGeminiAPIKey={googleGeminiAPIKey}
      //         mistralAPIKey={mistralAPIKey}
      //         perplexityAPIKey={perplexityAPIKey}
      //         useAzureOpenai={useAzureOpenai}
      //         onOpenaiAPIKeyChange={setOpenaiAPIKey}
      //         onOpenaiOrgIDChange={setOpenaiOrgID}
      //         onAzureOpenaiAPIKeyChange={setAzureOpenaiAPIKey}
      //         onAzureOpenaiEndpointChange={setAzureOpenaiEndpoint}
      //         onAzureOpenai35TurboIDChange={setAzureOpenai35TurboID}
      //         onAzureOpenai45TurboIDChange={setAzureOpenai45TurboID}
      //         onAzureOpenai45VisionIDChange={setAzureOpenai45VisionID}
      //         onAzureOpenaiEmbeddingsIDChange={setAzureOpenaiEmbeddingsID}
      //         onAnthropicAPIKeyChange={setAnthropicAPIKey}
      //         onGoogleGeminiAPIKeyChange={setGoogleGeminiAPIKey}
      //         onMistralAPIKeyChange={setMistralAPIKey}
      //         onPerplexityAPIKeyChange={setPerplexityAPIKey}
      //         onUseAzureOpenaiChange={setUseAzureOpenai}
      //         openrouterAPIKey={openrouterAPIKey}
      //         onOpenrouterAPIKeyChange={setOpenrouterAPIKey}
      //       />
      //     </StepContainer>
      //   )

      // Finish Step
      case 3:
        return (
          <StepContainer
            stepDescription="You are all set up!"
            stepNum={currentStep}
            stepTitle="Setup Complete"
            onShouldProceed={handleShouldProceed}
            showNextButton={true}
            showBackButton={true}
          >
            <FinishStep displayName={displayName} />
          </StepContainer>
        )
      default:
        return null
    }
  }

  if (loading) {
    return null
  }

  return (
    <div className="flex size-full items-center justify-center sm:w-auto">
      {renderStep(currentStep)}
    </div>
  )
}
