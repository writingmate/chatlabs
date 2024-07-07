"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import LoginForm from "@/components/login/login-form"
import React, { ReactPortal, useState } from "react"

export default function LoginDialog({ redirectTo }: { redirectTo?: string }) {
  const [dialogOpen, setOpen] = useState(true)

  return (
    <Dialog open={dialogOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          id={"dialog"}
          className={
            "absolute right-0 top-0 z-[100] size-full cursor-auto h-screen" +
            " w-screen"
          }
        ></div>
      </DialogTrigger>
      <DialogContent className={"rounded-xl"}>
        <LoginForm redirectTo={redirectTo} />
      </DialogContent>
    </Dialog>
  )
}
