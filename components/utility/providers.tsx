"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes/dist/types"
import { FC } from "react"
import { AuthProvider } from "@/context/auth"
import { AmplitudeProvider } from "@/@providers/AmplitudeProvider"

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
