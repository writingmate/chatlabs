import { NextResponse } from "next/server"
import { getServerProfile } from "@/lib/server/server-chat-helpers"

export const runtime = "edge"

export async function GET(request: Request) {
  try {
    // Attempt to get the server profile
    const profile = await getServerProfile()

    // If we reach this point, the user is authorized
    return NextResponse.json(
      { message: "Authorized", profile },
      { status: 200 }
    )
  } catch (error: any) {
    // If getServerProfile() throws an exception, the user is not authorized
    return NextResponse.json(
      { message: "Unauthorized", error: error.message },
      { status: 401 }
    )
  }
}
