"use client"

import { useEffect, useState } from "react"
import { useRouter } from "nextjs-toploader/app"

import { supabase } from "@/lib/supabase/browser-client"
import { ChangePassword } from "@/components/utility/change-password"

export default function ChangePasswordPage() {
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const session = (await supabase.auth.getSession()).data.session

      if (!session) {
        router.push("/login")
      } else {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return null
  }

  return <ChangePassword />
}
