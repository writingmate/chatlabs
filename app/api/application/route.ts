import {
  createApplication,
  getApplicationById,
  updateApplication,
  deleteApplication
} from "@/db/applications"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const profile = await getServerProfile()
    const { application, files, tools } = await req.json()

    const createdApplication = await createApplication(
      { ...application, user_id: profile.user_id },
      files,
      tools
    )

    return NextResponse.json(createdApplication)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams?.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      )
    }

    const application = await getApplicationById(id)
    return NextResponse.json(application)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, application } = await req.json()
    const updatedApplication = await updateApplication(id, application)
    return NextResponse.json(updatedApplication)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams?.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      )
    }

    await deleteApplication(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
