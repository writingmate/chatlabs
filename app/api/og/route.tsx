import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

import { logger } from "@/lib/logger"
import { createErrorResponse } from "@/lib/response"
import { getBaseUrl } from "@/lib/utils/og"

export const runtime = "edge"
export const fetchCache = "force-cache"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const title = searchParams.get("title") || "ChatLabs"
    const description =
      searchParams.get("description") || "All-in-one AI Platform"
    const baseUrl = getBaseUrl()
    const logoUrl = searchParams.get("logo") || `${baseUrl}/chatlabs.png`

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
            background: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)",
            padding: "40px 80px",
            position: "relative"
          }}
        >
          {/* Subtle Gradient Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.02) 0%, transparent 70%)",
              zIndex: 0
            }}
          />

          {/* Content Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              gap: "32px"
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                background: "rgba(0, 0, 0, 0.03)",
                borderRadius: "9999px"
              }}
            >
              <img src={logoUrl} alt="ChatLabs Logo" width="100" height="100" />
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: "#111111",
                textAlign: "center",
                lineHeight: 1.2,
                padding: "0 20px",
                maxWidth: "900px"
              }}
            >
              {title}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: 32,
                color: "#666666",
                textAlign: "center",
                margin: 0,
                maxWidth: "700px",
                lineHeight: 1.4
              }}
            >
              {description}
            </div>
          </div>

          {/* Bottom Border */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: "rgba(0, 0, 0, 0.05)"
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    )
  } catch (error) {
    logger.error({ error }, "Failed to generate OG image")
    return createErrorResponse("Failed to generate OG image", 500)
  }
}
