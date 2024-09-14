import "../(private)/globals.css"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google"

export const metadata = {
  title: "ImogenAI",
  description: "Created with ImogenAI App Builder"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html className="en">
      <body>{children}</body>
      {process.env.NODE_ENV === "production" && (
        <>
          <Analytics />
          <SpeedInsights />
          <GoogleAnalytics gaId="G-DY8D1FRVKT" />
          <GoogleTagManager gtmId={"GTM-5W2BH5K5"} />
        </>
      )}
    </html>
  )
}
