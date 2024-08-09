import { NextRequest, NextResponse } from "next/server"
import { getFileByHashId } from "@/db/files"
import { createChat } from "@/db/chats"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { getHomeWorkspaceByUserId, getWorkspaceById } from "@/db/workspaces"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createMessages } from "@/db/messages"

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

    // Create a new chat

    console.log("Creating chat with file:", file, profile)

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
        model: workspace.default_model,
        name: "Remix " + file.name,
        temperature: workspace.default_temperature,
        embeddings_provider: workspace.embeddings_provider
      },
      supabase
    )

    // Add the file content as the first message in the chat
    const messageContent = `
Let's modify this code 
    
\`\`\`html
#filename=remix_${file.name}#
${file.file_items[0].content}
\`\`\``

    await createMessages(
      [
        {
          chat_id: createdChat.id,
          role: "user",
          content: messageContent,
          user_id: profile.user_id,
          model: workspace.default_model,
          image_paths: [],
          sequence_number: 0
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
