import { getToolById } from "@/db/tools"
import { NextRequest, NextResponse } from "next/server"
import { Tables } from "@/supabase/types"
import { executeTool, matchRoute } from "@/lib/tools/utils"
import {
  platformToolDefinitions,
  platformToolFunctionSpec
} from "@/lib/platformTools/utils/platformToolsUtils"
import { OpenAPIV3 } from "openapi-types"
import { logger } from "@/lib/logger"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; path?: string[] } }
) {
  return handleRequest(request, "GET", params)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; path?: string[] } }
) {
  return handleRequest(request, "POST", params)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; path?: string[] } }
) {
  return handleRequest(request, "PUT", params)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; path?: string[] } }
) {
  return handleRequest(request, "PATCH", params)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; path?: string[] } }
) {
  return handleRequest(request, "DELETE", params)
}

async function handleRequest(
  request: NextRequest,
  method: string,
  { id: toolId, path: pathSegments }: { id: string; path?: string[] }
) {
  try {
    logger.debug(`Received ${method} request for tool ID: ${toolId}`)

    const supabase = createClient(cookies())

    const headers = Object.fromEntries(request.headers)
    const body =
      method !== "GET" && method !== "HEAD" ? await request.json() : undefined
    const path = `/${pathSegments?.join("/") || ""}`

    // 1. Grab tool by id
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
      logger.warn(`Tool not found: ${toolId}`)
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    const schema: OpenAPIV3.Document = JSON.parse(tool.schema as string)

    // 2. Grab operationId or path from [[...path]] parameters
    let operationId: string | undefined
    let pathObject: OpenAPIV3.PathItemObject | undefined
    let match: { route: string; params: Record<string, string> } | null = null
    for (const [schemaPath, pathItem] of Object.entries(schema.paths)) {
      console.log({ schemaPath, path })
      match = matchRoute(path, schemaPath)
      if (match && pathItem) {
        pathObject = pathItem
        operationId = (
          pathItem[
            method.toLowerCase() as OpenAPIV3.HttpMethods
          ] as OpenAPIV3.OperationObject
        )?.operationId
        logger.debug(`Operation ID found: ${operationId}`)
        break
      }
    }

    if (!pathObject) {
      logger.warn(`Path not found in schema: ${path}`)
      return NextResponse.json(
        { error: "Path not found in schema" },
        { status: 404 }
      )
    }

    if (!operationId) {
      logger.warn(`Method not allowed for this path: ${method} ${path}`)
      return NextResponse.json(
        { error: "Method not allowed for this path" },
        { status: 405 }
      )
    }

    // 3. Map this call into the operation defined in the schema
    const operation = pathObject[
      method.toLowerCase() as OpenAPIV3.HttpMethods
    ] as OpenAPIV3.OperationObject

    // Validate request against schema (simplified, you might want to use a proper OpenAPI validator)
    if (operation.requestBody && body) {
      // Validate body
      // You can implement more detailed validation here using the schema
    }
    if (operation.parameters) {
      // Validate parameters
      // You can implement more detailed validation here using the schema
    }

    // 4. Invoke the operation
    if (isPlatformTool) {
      logger.debug(`Invoking platform tool function: ${operationId}`)
      const toolFunctionSpec = platformToolFunctionSpec(operationId)
      if (!toolFunctionSpec) {
        throw new Error(`Function ${operationId} not found`)
      }

      const result = await toolFunctionSpec.toolFunction({
        ...body,
        ...(match?.params || {}),
        ...Object.fromEntries(new URL(request.url).searchParams)
      })

      logger.debug(
        `Platform tool function executed successfully: ${operationId}`
      )
      return NextResponse.json(result)
    } else {
      logger.debug({ schema }, `Invoking regular tool function: ${operationId}`)
      const schemaDetail = {
        url: schema?.servers?.[0]?.url || tool.url,
        headers: tool.custom_headers,
        routeMap: { [path]: operationId },
        requestInBodyMap: { [path]: method !== "GET" && method !== "HEAD" }
      }

      const { result } = await executeTool([schemaDetail], {
        name: operationId,
        arguments: {
          ...body,
          parameters: Object.fromEntries(new URL(request.url).searchParams)
        }
      })

      logger.debug(
        { result },
        `Regular tool function executed successfully: ${operationId}`
      )
      return NextResponse.json(result)
    }
  } catch (error: any) {
    logger.error(`Error handling tool request: ${error.message}`)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
