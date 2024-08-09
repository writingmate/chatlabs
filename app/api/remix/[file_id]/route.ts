import { NextRequest, NextResponse } from "next/server"
import { copyFileAndFileItems, getFileByHashId } from "@/db/files"
import { createChat } from "@/db/chats"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { getHomeWorkspaceByUserId, getWorkspaceById } from "@/db/workspaces"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createMessage } from "@/db/messages"
import { createChatFiles } from "@/db/chat-files"

export async function POST(
  request: NextRequest,
  { params }: { params: { file_id: string } }
) {
  const { file_id } = params

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const profile = await getServerProfile()

  const workspaceId = await getHomeWorkspaceByUserId(profile.user_id, supabase)

  const workspace = await getWorkspaceById(workspaceId, supabase)

  try {
    // Get the file content
    const file = await getFileByHashId(file_id)
    if (
      !file ||
      file.type !== "html" ||
      file.sharing !== "public" ||
      file.file_items.length === 0
    ) {
      return NextResponse.json(
        { error: "File not found or not accessible" },
        { status: 404 }
      )
    }

    const createdChat = await createChat(
      {
        user_id: profile.user_id,
        sharing: "private",
        workspace_id: workspaceId,
        prompt: workspace.default_prompt,
        assistant_id: null,
        context_length: 0,
        include_profile_context: false,
        include_workspace_instructions: false,
        model: "claude-3-5-sonnet-20240620",
        name: "Remix " + file.name,
        temperature: workspace.default_temperature,
        embeddings_provider: workspace.embeddings_provider
      },
      supabase
    )

    const copiedFile = await copyFileAndFileItems(
      file.id,
      workspaceId,
      profile.user_id,
      supabase
    )

    await createChatFiles(
      [
        {
          chat_id: createdChat.id,
          file_id: copiedFile.id,
          user_id: profile.user_id
        }
      ],
      supabase
    )

    return NextResponse.json({ chatId: createdChat.id })
  } catch (error) {
    console.error("Error remixing file:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
