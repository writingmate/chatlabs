"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import LoginForm from "@/components/login/login-form"
import React, { ReactPortal, useState } from "react"

export default function LoginDialog({ open = false }: { open: boolean }) {
  const [dialogOpen, setOpen] = useState(open)

  return (
    <Dialog open={dialogOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {open && (
          <div
            className={"size-screen absolute right-0 top-0 z-[100] cursor-auto"}
          ></div>
        )}
      </DialogTrigger>
      <DialogContent className={"rounded-xl"}>
        <LoginForm />
      </DialogContent>
    </Dialog>
  )
}
