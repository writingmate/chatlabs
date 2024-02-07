"use client"

import { Brand } from "@/components/ui/brand"
import { Button } from "@/components/ui/button"
import { redirect, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/browser-client"
import { GoogleSVG } from "@/components/icons/google-svg"
import { MicrosoftSVG } from "@/components/icons/microsoft-svg"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import Loading from "../loading"

// export const metadata: Metadata = {
//   title: "Login"
// }

export default async function Login({
  searchParams
}: {
  searchParams: { message: string }
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const { theme } = useTheme()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setLoading(false)
        return
      }
      supabase
        .from("workspaces")
        .select("*")
        .eq("user_id", data.session.user.id)
        .eq("is_home", true)
        .single()
        .then(({ data: homeWorkspace, error }) => {
          if (!homeWorkspace) {
            setLoading(false)
            throw new Error(error.message)
          }
          console.log(homeWorkspace)

          return router.push(`/${homeWorkspace.id}/chat`)
        })
    })
  }, [])

  const handleOAuthLogin = async (provider: "azure" | "google") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      return router.push(`/login?message=${error.message}`)
    }

    // Add any additional logic needed after successful login
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <form className="animate-in text-foreground flex w-full flex-1 flex-col justify-center gap-2">
        <Brand theme={theme === "dark" ? "dark" : "light"} />

        <Button
          onClick={() => handleOAuthLogin("google")}
          className="text-md mb-1 mt-4 rounded-lg bg-violet-700 px-4 py-2 text-white"
        >
          <GoogleSVG height={20} width={20} className="mr-2" /> Continue with
          Google
        </Button>

        <Button
          onClick={() => handleOAuthLogin("azure")}
          className="border-foreground/20 text-md mb-1 rounded-lg border px-4 py-2"
        >
          <MicrosoftSVG height={20} width={20} className="mr-2" />
          Continue with Microsoft
        </Button>

        {searchParams?.message && (
          <p className="bg-foreground/10 text-foreground mt-4 p-4 text-center">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}
