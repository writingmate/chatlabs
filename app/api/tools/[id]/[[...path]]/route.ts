import { getToolById } from "@/db/tools"
import { platformToolDefinitionById } from "@/db/platform-tools"
import { NextRequest, NextResponse } from "next/server"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import OpenAPIValidator from "openapi-schema-validator"
import { Tables } from "@/supabase/types"
import { executeTool } from "@/lib/tools/utils"
import {
  platformToolDefinitions,
  platformToolFunctionSpec
} from "@/lib/platformTools/utils/platformToolsUtils"
import { OpenAPIV3 } from "openapi-types"

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
    const headers = Object.fromEntries(request.headers)
    const body =
      method !== "GET" && method !== "HEAD" ? await request.json() : undefined
    const path = `/${pathSegments?.join("/") || ""}`

    // 1. Grab tool by id
    let tool: Tables<"tools"> | undefined | null = null
    let isPlatformTool = false
    try {
      tool = await getToolById(toolId)
    } catch (error) {
      tool = platformToolDefinitions().find(tool => tool.id === toolId)
      isPlatformTool = true
    }

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    const schema: OpenAPIV3.Document = JSON.parse(tool.schema as string)

    // 2. Grab operationId or path from [[...path]] parameters
    let operationId: string | undefined
    let pathObject: OpenAPIV3.PathItemObject | undefined
    for (const [schemaPath, pathItem] of Object.entries(schema.paths)) {
      if (schemaPath === path && pathItem) {
        pathObject = pathItem
        operationId = (
          pathItem[
            method.toLowerCase() as OpenAPIV3.HttpMethods
          ] as OpenAPIV3.OperationObject
        )?.operationId
        break
      }
    }

    if (!pathObject) {
      return NextResponse.json(
        { error: "Path not found in schema" },
        { status: 404 }
      )
    }

    if (!operationId) {
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
      // Handle platform tool
      const toolFunctionSpec = platformToolFunctionSpec(operationId)
      if (!toolFunctionSpec) {
        throw new Error(`Function ${operationId} not found`)
      }

      const result = await toolFunctionSpec.toolFunction({
        ...body,
        ...Object.fromEntries(new URL(request.url).searchParams)
      })

      return NextResponse.json(result)
    } else {
      // Handle regular tool
      const schemaDetail = {
        url: tool.url,
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

      return NextResponse.json(result)
    }
  } catch (error: any) {
    console.error("Error handling tool request:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
