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
import { Input } from "@/components/ui/input"
import { IconMail } from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"
import {
  getHomeWorkspaceByUserId,
  getWorkspacesByUserId
} from "@/db/workspaces"
import { getProfileByUserId } from "@/db/profile"
import LoginForm from "@/components/login/login-form"

// export const metadata: Metadata = {
//   title: "Login"
// }

export default function Login({
  searchParams
}: {
  searchParams: { message: string; error_description: string }
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setLoading(false)
        return
      }
      const userId = data.session.user.id
      Promise.all([
        getProfileByUserId(userId),
        getWorkspacesByUserId(userId)
      ]).then(([profile, workspaces]) => {
        if (profile?.has_onboarded) {
          return router.push(`/chat`)
        }
        return router.push("/setup")
      })
    })
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <LoginForm />

      {searchParams?.message && (
        <p className="bg-accent text-foreground mt-4 rounded-lg bg-purple-300 p-4 text-center">
          {searchParams.message}
        </p>
      )}

      {searchParams?.error_description && (
        <p className="text-foreground mt-4 rounded-lg bg-red-300 p-4 text-center">
          {searchParams.error_description}
        </p>
      )}
    </div>
  )
}
