import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const title = searchParams.get("title") || "ChatLabs"
    const description = searchParams.get("description") || "AI Chat Platform"

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
            padding: "40px 80px"
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/chatlabs.png`}
              alt="ChatLabs Logo"
              width="80"
              height="80"
            />
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 60,
              fontWeight: 800,
              background: "linear-gradient(to bottom right, #FFFFFF, #9089FC)",
              backgroundClip: "text",
              color: "transparent",
              margin: "20px 0",
              textAlign: "center",
              letterSpacing: "-0.05em"
            }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: 30,
              color: "#888",
              textAlign: "center",
              margin: 0,
              marginTop: 10
            }}
          >
            {description}
          </p>
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    )
  } catch (e) {
    return new Response("Failed to generate OG image", { status: 500 })
  }
}
