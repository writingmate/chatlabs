"use client"

import { FC } from "react"
import { AmplitudeProvider } from "@/context/AmplitudeProvider"
import { AuthProvider } from "@/context/auth"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes/dist/types"

import { TooltipProvider } from "@/components/ui/tooltip"

export const Providers: FC<ThemeProviderProps> = ({ children, ...props }) => {
  return (
    <NextThemesProvider {...props}>
      <TooltipProvider>
        <AuthProvider forceLogin={true}>
          <AmplitudeProvider>{children}</AmplitudeProvider>
        </AuthProvider>
      </TooltipProvider>
    </NextThemesProvider>
  )
}
