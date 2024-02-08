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

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        return router.push("/login")
      }
      supabase
        .from("workspaces")
        .select("*")
        .eq("user_id", data.session.user.id)
        .eq("is_home", true)
        .single()
        .then(({ data: homeWorkspace, error }) => {
          if (!homeWorkspace) {
            throw new Error(error.message)
          }
          console.log(homeWorkspace)

          return router.push(`/${homeWorkspace.id}/chat`)
        })
    })
  }, [])

  return <Loading />
}
