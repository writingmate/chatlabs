"use client"

import * as amplitude from '@amplitude/analytics-browser'
import { Experiment, ExperimentClient } from '@amplitude/experiment-js-client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from '@/context/auth'

interface AmplitudeContextType {
    amplitude: typeof amplitude
    experiment: ExperimentClient
    isReady: boolean
}

const AmplitudeContext = createContext<AmplitudeContextType | undefined>(undefined)

export function AmplitudeProvider({ children }: { children: ReactNode }) {
    const [isReady, setIsReady] = useState(false)
    const { user, profile } = useAuth()
    const [experiment, setExperiment] = useState<ExperimentClient | null>(null)

    useEffect(() => {
        amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || '959de43582eb3458ab34b08a446e036c')
        const experiment = Experiment.initializeWithAmplitudeAnalytics(
            process.env.NEXT_PUBLIC_AMPLITUDE_DEPLOYMENT_KEY || 'client-fwdKioDMLvus1pDKtgsiZZ5YCt5oiSCA',
            { debug: process.env.NODE_ENV === 'development' }
        )

        setExperiment(experiment)

        experiment.fetch().then(() => setIsReady(true))

        if (user) {
            amplitude.identify(new amplitude.Identify().set('email', user.email as string))
        }

        if (profile) {
            amplitude.identify(new amplitude.Identify().set('plan', profile.plan as string))
        }
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
        throw new Error('useAmplitude must be used within an AmplitudeProvider')
    }
    return context
}