"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/browser-client"
import { getWorkspacesByUserId } from "@/db/workspaces"
import { getProfileByUserId } from "@/db/profile"
import { ChatUI } from "@/components/chat/chat-ui"
import { Dashboard } from "@/components/ui/dashboard"
import LoginDialog from "@/components/login/login-dialog"

export default function HomePage() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        return
      }
      const userId = data.session.user.id
      window.gtag?.("set", { user_id: userId })
      window.dataLayer?.push({ user_id: userId })
    })
  }, [])

  return (
    <>
      <Dashboard>
        <ChatUI experimentalCodeEditor={false} />
      </Dashboard>
      <LoginDialog />
    </>
  )
}
