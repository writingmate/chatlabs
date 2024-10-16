import { Toaster } from "@/components/ui/sonner"
import { GlobalState } from "@/components/utility/global-state"
import { Providers } from "@/components/utility/providers"
import { Metadata, Viewport } from "next"
import { DM_Sans } from "next/font/google"
import { ReactNode } from "react"
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import NextTopLoader from "nextjs-toploader"

const font = DM_Sans({ subsets: ["latin"] })
const APP_NAME = "ChatLabs"
const APP_DEFAULT_TITLE = "ChatLabs"
const APP_TITLE_TEMPLATE = "%s - ChatLabs"
const APP_DESCRIPTION =
  "ChatLabs is a platform for LLM and AI tinkerers. Experience more than 30 AI models in one place."

interface RootLayoutProps {
  children: ReactNode
  params: {
    locale: string
  }
}

export const metadata: Metadata = {
  applicationName: APP_NAME,
  metadataBase: new URL("https://labs.writingmate.ai/"),
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: APP_DEFAULT_TITLE
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  }
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content"
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={"h-full"}>
      <head>
        <link
          rel="preconnect dns-prefetch"
          href="https://fonts.googleapis.com"
        />
        <link rel="preconnect dns-prefetch" href="https://fonts.gstatic.com" />
        <link
          rel="preconnect dns-prefetch"
          href={process.env.NEXT_PUBLIC_SUPABASE_URL}
        />
      </head>
      <body className={font.className + " h-full antialiased"}>
        <NextTopLoader
          color={"gray"}
          height={1}
          shadow={false}
          showSpinner={false}
        />
        <Providers attribute="class" defaultTheme="light">
          <Toaster richColors position="top-center" duration={3000} />
          <div className="bg-background text-foreground flex size-full flex-col items-center sm:h-screen">
            <GlobalState>{children}</GlobalState>
          </div>
        </Providers>
        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
            <GoogleAnalytics gaId="G-Y14R2TP0QH" />
            <GoogleTagManager gtmId={"GTM-5SBXJ23Q"} />
          </>
        )}
      </body>
    </html>
  )
}
