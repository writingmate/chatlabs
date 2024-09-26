"use client"

import { useSearchParams } from "next/navigation"
import LoginForm from "@/components/login/login-form"

export default function Login() {
  const searchParams = useSearchParams()

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <LoginForm />

      {searchParams?.get("message") && (
        <p className="bg-accent text-foreground mt-4 rounded-lg bg-purple-300 p-4 text-center">
          {searchParams?.get("message")}
        </p>
      )}

      {searchParams?.get("error_message") && (
        <p className="text-foreground mt-4 rounded-lg bg-red-300 p-4 text-center">
          {searchParams?.get("error_message")}
        </p>
      )}
    </div>
  )
}
