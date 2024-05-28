"use client"

import { Brand } from "@/components/ui/brand"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/browser-client"
import { GoogleSVG } from "@/components/icons/google-svg"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { IconMail } from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [disabled, setDisabled] = useState(false)

  const { theme } = useTheme()

  const handleOAuthLogin = async (provider: "azure" | "google") => {
    setDisabled(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        scopes: "email",
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    setDisabled(false)

    if (error) {
      return router.push(`/login?message=${error.message}`)
    }

    // Add any additional logic needed after successful login
  }

  async function handleEmailLogin(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    setDisabled(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`
      }
    })

    setDisabled(false)

    if (error) {
      return router.push(`/login?message=${error.message}`)
    }

    return router.push("/login?message=Check your email for a login link")
  }

  return (
    <form className="animate-in text-foreground flex w-full flex-col justify-center gap-2">
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

      <Input
        disabled={disabled}
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="rounded-lg"
        placeholder={"sama@openai.com"}
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
  )
}
