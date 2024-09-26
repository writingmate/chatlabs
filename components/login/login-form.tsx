"use client"

import { Brand } from "@/components/ui/brand"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/browser-client"
import { GoogleSVG } from "@/components/icons/google-svg"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { IconMail } from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function LoginForm({
  redirectTo,
  popup = false
}: {
  redirectTo?: string
  popup?: boolean
}) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [disabled, setDisabled] = useState(false)
  const params = useSearchParams()

  redirectTo = params?.get("next") || redirectTo

  const { theme } = useTheme()

  const callbackRedirectSearchParams = new URLSearchParams()
  if (redirectTo) {
    callbackRedirectSearchParams.append("next", redirectTo)
  }
  if (popup) {
    callbackRedirectSearchParams.append("popup", "true")
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "AUTH_COMPLETE") {
        if (event.data.error) {
          console.error("Authentication failed")
          toast.error(event.data.error)
        } else {
          console.log("Authentication successful")
          window.location.reload()
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const openAuthPopup = () => {
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    const features = `width=${width},height=${height},left=${left},top=${top}`
    return window.open("", "Auth", features)
  }

  const handleOAuthLogin = async (provider: "azure" | "google") => {
    setDisabled(true)

    let authPopup: Window | null = null
    if (popup) {
      // Open the popup immediately with a loading page if popup is true
      authPopup = openAuthPopup()
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        scopes: "email",
        redirectTo: `${window.location.origin}/auth/callback?${callbackRedirectSearchParams.toString()}`,
        skipBrowserRedirect: popup
      }
    })

    setDisabled(false)

    if (error) {
      authPopup?.close()
      return router.push(
        `/login?message=${error.message}&${callbackRedirectSearchParams.toString()}`
      )
    }

    if (popup && data.url) {
      // Update the popup URL after OAuth process is initiated
      const popupUrl = new URL(data.url)
      popupUrl.searchParams.append("popup", "true")
      authPopup?.location.replace(popupUrl.toString())
    }
  }

  async function handleEmailLogin(
    e: React.FormEvent<HTMLButtonElement | HTMLFormElement>
  ) {
    e.preventDefault()
    e.stopPropagation()
    setDisabled(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: encodeURIComponent(
          `${window.location.origin}/auth/confirm?${callbackRedirectSearchParams.toString()}`
        )
      }
    })

    setDisabled(false)

    if (error) {
      return router.push(`/login?message=${error.message}`)
    }

    return router.push("/login?message=Check your email for a login link")
  }

  return (
    <div className="animate-in text-foreground flex w-full flex-col justify-center gap-2">
      <Brand theme={theme === "dark" ? "dark" : "light"} />

      <Button
        disabled={disabled}
        onClick={() => handleOAuthLogin("google")}
        className="text-md mb-1 mt-4 rounded-lg bg-violet-700 px-4 py-2 text-white"
      >
        <GoogleSVG height={20} width={20} className="mr-2" /> Continue with
        Google
      </Button>

      <div className="text-foreground/70 my-4 flex items-center space-x-2 text-sm">
        <Separator className={"flex-1"} />
        <div>or</div>
        <Separator className={"flex-1"} />
      </div>

      <form onSubmit={e => handleEmailLogin(e)} className="flex flex-col gap-2">
        <Input
          required
          disabled={disabled}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="rounded-lg"
          placeholder={"Enter your company email"}
        />
        <Button
          disabled={disabled}
          variant={"outline"}
          onClick={e => handleEmailLogin(e)}
          className="text-md mb-1 rounded-lg px-4 py-2"
        >
          <IconMail height={20} width={20} stroke={1.5} className="mr-2" />
          Continue with email
        </Button>
      </form>
    </div>
  )
}
