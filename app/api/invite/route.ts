import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/browser-client"
import type { NextRequest } from "next/server"
import { createWorkspace } from "@/db/workspaces"
import { createProfile } from "@/db/profile"
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/supabase/types"

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SignInWithOtpRequestBody {
  email: string
  workspace_id?: string
}

export async function POST(request: NextRequest) {
  const body: SignInWithOtpRequestBody = await request.json()
  const { email, workspace_id } = body

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const { data: user } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("username", email)
    .single()

  let userId: string | undefined = user?.user_id
  if (!userId) {
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: false
      })

    if (!newUser.user) {
      return NextResponse.json({ error: createError?.message }, { status: 400 })
    }

    userId = newUser.user.id

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${baseUrl}/auth/confirm`
      }
    })

    await supabaseAdmin.from("profiles").insert({
      bio: "",
      display_name: "",
      image_path: "",
      image_url: "",
      profile_context: "",
      use_azure_openai: false,
      user_id: newUser.user?.id,
      username: newUser.user?.email || ""
    })

    let workspaceId = workspace_id
    if (!workspaceId) {
      const { data: workspaceData } = await supabaseAdmin
        .from("workspaces")
        .insert({
          default_context_length: 0,
          default_model: "",
          default_prompt: "You are a friendly, helpful AI assistant.",
          default_temperature: 0,
          description: "",
          embeddings_provider: "",
          include_profile_context: false,
          include_workspace_instructions: false,
          instructions: "",
          name: "HOME"
        })
        .select("*")
        .single()
      workspaceId = workspaceData?.id
    }
    const x = await supabaseAdmin.from("workspace_profiles").insert({
      user_id: newUser.user?.id,
      workspace_id: workspaceId || ""
    })
  } else {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${baseUrl}/auth/confirm`
      }
    })

    if (!data) {
      return NextResponse.json({ error: error?.message }, { status: 400 })
    }
  }

  return NextResponse.json({ data: "ok" }, { status: 200 })
}
