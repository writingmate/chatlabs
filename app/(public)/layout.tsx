import "../(private)/globals.css"

import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: "ChatLabs",
  description: "Created with ChatLabs App Builder"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
      {process.env.NODE_ENV === "production" && (
        <>
          <Analytics />
          <SpeedInsights />
          <GoogleAnalytics gaId="G-Y14R2TP0QH" />
          <GoogleTagManager gtmId={"GTM-5SBXJ23Q"} />
        </>
      )}
    </html>
  )
}
