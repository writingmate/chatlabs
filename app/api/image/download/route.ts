import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }

  try {
    const imageResponse = await fetch(url)
    if (!imageResponse.ok) throw new Error("Failed to fetch image")

    const contentType = imageResponse.headers.get("content-type")
    const arrayBuffer = await imageResponse.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType || "image/png",
        "Content-Disposition": "attachment; filename=image.png"
      }
    })
  } catch (error) {
    console.error("Error downloading image:", error)
    return NextResponse.json(
      { error: "Failed to download image" },
      { status: 500 }
    )
  }
}
