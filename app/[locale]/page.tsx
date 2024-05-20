"use client"

import { ChatbotUISVG } from "@/components/icons/chatbotui-svg"
import { IconArrowRight } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Brand } from "@/components/ui/brand"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/browser-client"
import Loading from "@/app/[locale]/loading"
import {
  getHomeWorkspaceByUserId,
  getWorkspaceById,
  getWorkspacesByUserId
} from "@/db/workspaces"
import { getProfileByUserId } from "@/db/profile"
import { ChatUI } from "@/components/chat/chat-ui"
import { Dashboard } from "@/components/ui/dashboard"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        return router.push("/")
      }
      const userId = data.session.user.id
      window.gtag?.("set", { user_id: userId })
      window.dataLayer?.push({ user_id: userId })
      Promise.all([
        getProfileByUserId(userId),
        getWorkspacesByUserId(userId)
      ]).then(([profile, workspaces]) => {
        if (profile?.has_onboarded) {
          return router.push(`/${workspaces[0].id}/chat`)
        }
        return router.push("/setup")
      })
    })
  }, [])

  return (
    <Dashboard>
      <ChatUI />
    </Dashboard>
  )
  // </Dashboard>
}
