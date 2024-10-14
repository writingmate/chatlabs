import { NextRequest, NextResponse } from "next/server"
import { matchRoute, RouteMatch } from "@/utils/matchRoute"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { logger } from "@/lib/logger"
import { getToolById } from "@/db/tools"
import { Tables } from "@/supabase/types"
import {
  platformToolDefinitions,
  platformToolFunctionSpec
} from "@/lib/platformTools/utils/platformToolsUtils"

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { segments: string[] } }
) {
  return handleRequest(request, params.segments, "DELETE")
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
    let tool: Tables<"tools"> | undefined | null = null
    let isPlatformTool = false
    try {
      tool = await getToolById(toolId, supabase)
      logger.debug(`Tool found: ${toolId}`)
    } catch (error) {
      tool = platformToolDefinitions().find(tool => tool.id === toolId)
      isPlatformTool = true
      logger.debug(`Platform tool found: ${toolId}`)
    }

    if (!tool) {
      logger.error(`Tool not found: ${toolId}`)
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    // 2 & 3. Read headers and schema properties
    let { custom_headers: headers, schema } = tool

    schema = JSON.parse(schema as string)
    headers = JSON.parse((headers as string) || "{}")

    if (!schema || typeof schema !== "object" || !("paths" in schema)) {
      return NextResponse.json({ error: "Invalid schema" }, { status: 500 })
    }

    // 4 & 5. Match route from schema
    const url = new URL(request.url)
    const matchedRoute = matchRoute(
      schema.paths as Record<string, any>,
      path,
      method,
      url.searchParams
    )

    if (!matchedRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }

    // 6. Prepare request for proxying or execution
    // @ts-ignore
    const targetUrl = new URL(
      matchedRoute.route,
      schema?.servers?.[0]?.url || tool.url
    )

    // Add path parameters to the target URL
    Object.entries(matchedRoute.params).forEach(([key, value]) => {
      targetUrl.pathname = targetUrl.pathname.replace(`{${key}}`, value)
    })

    // Add query parameters to the target URL
    Object.entries(matchedRoute.queryParams).forEach(([key, value]) => {
      targetUrl.searchParams.append(key, value)
    })

    // Prepare headers
    const proxyHeaders = new Headers(headers as Record<string, string>)

    // Prepare body
    let body: any = null
    let contentType = null
    if (method !== "GET" && method !== "HEAD") {
      contentType = request.headers.get("content-type")
      if (
        contentType &&
        contentType.includes("application/x-www-form-urlencoded")
      ) {
        const formData = await request.formData()
        body = Object.fromEntries(formData)
        contentType = "multipart/form-data"
      } else if (contentType && contentType.includes("multipart/form-data")) {
        body = await request.formData()
        contentType = "multipart/form-data"
      } else if (contentType && contentType.includes("application/json")) {
        body = await request.json()
        contentType = "application/json"
      } else {
        body = await request.text()
        contentType = "text/plain"
      }
      logger.info(
        { bodyType: typeof body, contentType },
        "Prepared request body"
      )
    }

    if (isPlatformTool) {
      // Handle platform tool execution
      const operationId = matchedRoute.operationId
      logger.debug(`Invoking platform tool function: ${operationId}`)
      const toolFunctionSpec = platformToolFunctionSpec(operationId)
      if (!toolFunctionSpec) {
        throw new Error(`Function ${operationId} not found`)
      }

      const result = await toolFunctionSpec.toolFunction({
        ...body,
        ...matchedRoute.params,
        ...Object.fromEntries(url.searchParams)
      })

      logger.debug(
        `Platform tool function executed successfully: ${operationId}`
      )
      return NextResponse.json(result)
    } else {
      // Handle regular tool execution or proxying
      logger.info(
        {
          method,
          url: targetUrl.toString(),
          headers: Object.fromEntries(proxyHeaders.entries()),
          bodyPresent: body !== null
        },
        "Proxying request"
      )

      let finalBody = null

      if (contentType === "multipart/form-data") {
        finalBody = body
      } else if (contentType === "application/json") {
        finalBody = JSON.stringify(body)
      } else {
        finalBody = body
      }

      // Make the proxied request
      const proxyResponse = await fetch(targetUrl.toString(), {
        method,
        headers: Object.fromEntries(proxyHeaders.entries()),
        body: finalBody
      })

      // Return the proxied response
      const responseData = await proxyResponse.text()
      logger.info({ responseData }, "Proxied response")
      return new NextResponse(responseData, {
        status: proxyResponse.status,
        statusText: proxyResponse.statusText,
        headers: proxyResponse.headers
      })
    }
  } catch (error) {
    logger.error({ error }, "Proxy error")
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
