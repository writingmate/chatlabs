import { NextRequest, NextResponse } from "next/server"
import { matchRoute, RouteMatch } from "@/utils/matchRoute"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: { segments: string[] } }
) {
  return handleRequest(request, params.segments, "GET")
}

export async function POST(
  request: NextRequest,
  { params }: { params: { segments: string[] } }
) {
  return handleRequest(request, params.segments, "POST")
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { segments: string[] } }
) {
  return handleRequest(request, params.segments, "PUT")
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { segments: string[] } }
) {
  return handleRequest(request, params.segments, "PATCH")
}

async function handleRequest(
  request: NextRequest,
  segments: string[],
  method: string
) {
  try {
    if (segments.length < 2) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    const toolId = segments[0]
    const path = "/" + segments.slice(1).join("/")

    const supabase = createClient(cookies())

    // 1. Fetch tool by ID from Supabase
    const { data: tool, error } = await supabase
      .from("tools")
      .select("*")
      .eq("id", toolId)
      .single()

    if (error || !tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    // 2 & 3. Read headers and schema properties
    let { custom_headers: headers, schema } = tool

    schema = JSON.parse(schema)
    headers = JSON.parse(headers)

    if (!schema || !schema.paths) {
      return NextResponse.json({ error: "Invalid schema" }, { status: 500 })
    }

    // 4 & 5. Match route from schema
    const url = new URL(request.url)
    const matchedRoute = matchRoute(
      schema.paths,
      path,
      method,
      url.searchParams
    )

    if (!matchedRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }

    // 6. Proxy the request
    const targetUrl = new URL(matchedRoute.route, schema.servers[0].url)

    // Add path parameters to the target URL
    Object.entries(matchedRoute.params).forEach(([key, value]) => {
      targetUrl.pathname = targetUrl.pathname.replace(`{${key}}`, value)
    })

    // Add query parameters to the target URL
    Object.entries(matchedRoute.queryParams).forEach(([key, value]) => {
      targetUrl.searchParams.append(key, value)
    })

    // Prepare headers
    const proxyHeaders = new Headers(request.headers)

    const allowedHeaders = [
      "content-type",
      "accept",
      "authorization",
      "x-api-key"
    ]

    Object.entries(headers).forEach(([key, value]) => {
      proxyHeaders.set(key, value as string)
    })

    // Prepare body
    let body: BodyInit | null = null
    if (method !== "GET") {
      const contentType = proxyHeaders.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        body = JSON.stringify(await request.json())
      } else if (contentType && contentType.includes("multipart/form-data")) {
        body = await request.formData()
      } else {
        body = await request.text()
      }
    }

    proxyHeaders.forEach((value, key) => {
      if (!allowedHeaders.includes(key.toLowerCase())) {
        console.log("Deleting header", key)
        proxyHeaders.delete(key)
        proxyHeaders.delete(key.toLowerCase())
      }
    })

    // Make the proxied request
    const proxyResponse = await fetch(targetUrl, {
      method,
      headers: proxyHeaders,
      body
    })

    // Return the proxied response
    const responseData = await proxyResponse.text()
    return new NextResponse(responseData, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: proxyResponse.headers
    })
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
