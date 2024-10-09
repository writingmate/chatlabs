"use client"

import * as amplitude from "@amplitude/analytics-browser"
import { Experiment, ExperimentClient } from "@amplitude/experiment-js-client"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react"
import { useAuth } from "@/context/auth"

interface AmplitudeContextType {
  amplitude: typeof amplitude
  experiment: ExperimentClient
  isReady: boolean
}

const AmplitudeContext = createContext<AmplitudeContextType | undefined>(
  undefined
)

export function AmplitudeProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const { user, profile } = useAuth()
  const [experiment, setExperiment] = useState<ExperimentClient | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setIsReady(true)
      setExperiment({} as ExperimentClient)
      return
    }

    amplitude.init(
      process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ||
        "6e7e3c67016ad90aa9cb58b96ee1bcf7"
    )
    const experiment = Experiment.initializeWithAmplitudeAnalytics(
      process.env.NEXT_PUBLIC_AMPLITUDE_DEPLOYMENT_KEY ||
        "client-fwdKioDMLvus1pDKtgsiZZ5YCt5oiSCA"
    )

    setExperiment(experiment)

    experiment
      .fetch()
      .then(() => setIsReady(true))
      .catch(console.error)
      .finally(() => setIsReady(true))

    const identify = new amplitude.Identify()

    if (user) {
      identify.set("email", user.email as string)
      identify.set("id", user.id)
    }

    if (profile) {
      identify.set("plan", profile.plan as string)
    }

    amplitude.identify(identify)
  }, [user, profile])

  if (!experiment) {
    return null
  }

  return (
    <AmplitudeContext.Provider value={{ amplitude, experiment, isReady }}>
      {children}
    </AmplitudeContext.Provider>
  )
}

export function useAmplitude() {
  const context = useContext(AmplitudeContext)
  if (context === undefined) {
    throw new Error("useAmplitude must be used within an AmplitudeProvider")
  }
  return context
}
