"use client"

import { useAmplitude } from "@/@providers/AmplitudeProvider"
import { useEffect, useState } from "react"

export function useFeatureFlag(
  flagName: string,
  defaultValue: boolean = false
) {
  const { experiment, isReady } = useAmplitude()
  const [flagValue, setFlagValue] = useState(defaultValue)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (process.env.NODE_ENV == "development") {
      setFlagValue(defaultValue)
      setLoading(false)
      return
    }
    if (isReady) {
      const flag = experiment.variant(flagName)
      setFlagValue(flag.value === "on" || flag.value === "true")
      setLoading(false)
    }
  }, [flagName, defaultValue, isReady, experiment])

  return { flagValue, loading }
}
