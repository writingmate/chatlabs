"use client"

import { useEffect, useState } from "react"

import { logger } from "@/lib/logger"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface URLMessage {
  error?: string
  error_code?: string
  error_description?: string
  success?: string
  success_description?: string
}

const MESSAGE_CODE_TO_TITLE = {
  unauthorized_client: "Forbidden",
  invalid_grant: "Invalid Grant",
  invalid_request: "Invalid Request",
  invalid_scope: "Invalid Scope",
  server_error: "Internal Server Error",
  temporarily_unavailable: "Temporarily Unavailable",
  interaction_required: "Interaction Required",
  login_required: "Login Required",
  consent_required: "Consent Required",
  access_denied: "Access Denied"
} as Record<string, string>

const DEFAULT_ERROR_TITLE = "Error"

export function URLMessagePopup() {
  const [message, setMessage] = useState<URLMessage | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Parse hash parameters when component mounts
    const hash = window.location.hash.substring(1)
    if (!hash) return

    try {
      const params = new URLSearchParams(hash)
      const messageData: URLMessage = {}

      // Extract error related params
      if (params.get("error")) {
        messageData.error = params.get("error") || undefined
        messageData.error_code = params.get("error_code") || undefined
        messageData.error_description =
          params.get("error_description") || undefined
      }

      // Extract success related params
      if (params.get("success")) {
        messageData.success = params.get("success") || undefined
        messageData.success_description =
          params.get("success_description") || undefined
      }

      if (Object.keys(messageData).length > 0) {
        setMessage(messageData)
        setOpen(true)
        // Clear the hash without triggering a reload
        window.history.replaceState(null, "", window.location.pathname)
      }
    } catch (err) {
      logger.error({ err }, "Error parsing URL hash message")
    }
  }, [])

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      setMessage(null)
    }
  }

  if (!message) return null

  const isError = !!message.error
  const title = isError ? message.error : message.success
  const description = isError
    ? message.error_description
    : message.success_description

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={isError ? "border-destructive" : ""}>
        <DialogHeader>
          <DialogTitle className={isError ? "text-destructive" : ""}>
            {title && title in MESSAGE_CODE_TO_TITLE
              ? MESSAGE_CODE_TO_TITLE[title]
              : DEFAULT_ERROR_TITLE}
          </DialogTitle>
          {description && (
            <DialogDescription>
              {decodeURIComponent(description)}
            </DialogDescription>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
