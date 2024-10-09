"use client"

import { ApplicationPage } from "@/components/applications/application-page"
import { getApplicationById } from "@/db/applications"
import { Tables } from "@/supabase/types"
import { LLMID } from "@/types"
import React, { useEffect, useState } from "react"
import { Loader } from "@/components/ui/loader"

export default function ApplicationDetailPage({
  params
}: {
  params: { id: string }
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [application, setApplication] = useState<
    | (Tables<"applications"> & {
        models: LLMID[]
        tools: Tables<"tools">[]
      })
    | null
  >(null)

  const fetchApplication = async () => {
    try {
      const app = await getApplicationById(params.id)
      setApplication(app)
      setIsLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchApplication()
  }, [])

  if (isLoading || !application) {
    return <Loader withMessage={true} />
  }

  return <ApplicationPage application={application} />
}
