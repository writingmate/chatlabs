import { FunctionCallPayload } from "ai"
import { platformToolFunctionSpec } from "@/lib/platformTools/utils/platformToolsUtils"
import { Tables } from "@/supabase/types"
import OpenAI from "openai"
import { openapiToFunctions } from "@/lib/openapi-conversion"
import { getApplicationTools } from "@/db/applications"

export const TOOLS_SYSTEM_PROMPT = `
Today is ${new Date().toLocaleDateString()}.
`

export function prependSystemPrompt(messages: any[]) {
  if (messages[0].role == "system") {
    messages[0].content += TOOLS_SYSTEM_PROMPT
  } else {
    messages.unshift({
      role: "system",
      content: TOOLS_SYSTEM_PROMPT
    })
  }
}

export async function executeTool(
  schemaDetails: any,
  functionCall: FunctionCallPayload,
  applicationId?: string
) {
  const functionName = functionCall.name
  const resultProcessingMode = "send_to_llm"

  let parsedArgs = functionCall.arguments as any
  if (typeof functionCall.arguments === "string") {
    parsedArgs = JSON.parse((functionCall.arguments as string).trim())
  }

  // Find the schema detail that contains the function name
  const schemaDetail = schemaDetails.find((detail: any) =>
    Object.values(detail.routeMap).includes(functionName)
  )

  if (!schemaDetail) {
    throw new Error(`Function ${functionName} not found in any schema`)
  }

  // Reroute to local executor for local tools
  if (schemaDetail.url === "local://executor") {
    const toolFunctionSpec = platformToolFunctionSpec(functionName)
    if (!toolFunctionSpec) {
      throw new Error(`Function ${functionName} not found`)
    }

    if (applicationId) {
      // Fetch application-specific tools
      const applicationTools = await getApplicationTools(applicationId)
      const applicationToolIds = applicationTools.map(tool => tool?.id)

      // Check if the called function is allowed for this application
      if (!applicationToolIds.includes(toolFunctionSpec.id)) {
        throw new Error(
          `Function ${functionName} is not allowed for this application`
        )
      }
    }

    return {
      result: await toolFunctionSpec.toolFunction(parsedArgs),
      resultProcessingMode: toolFunctionSpec.resultProcessingMode
    }
  }

  const pathTemplate = Object.keys(schemaDetail.routeMap).find(
    key => schemaDetail.routeMap[key] === functionName
  )

  if (!pathTemplate) {
    throw new Error(`Path for function ${functionName} not found`)
  }

  const path = pathTemplate.replace(/:(\w+)/g, (_, paramName) => {
    const value = parsedArgs.parameters[paramName]
    if (!value) {
      throw new Error(
        `Parameter ${paramName} not found for function ${functionName}`
      )
    }
    return encodeURIComponent(value)
  })

  if (!path) {
    throw new Error(`Path for function ${functionName} not found`)
  }

  // Determine if the request should be in the body or as a query
  const isRequestInBody = schemaDetail.requestInBodyMap[path]
  let data = {}

  if (isRequestInBody) {
    // If the type is set to body
    let headers = {
      "Content-Type": "application/json"
    }

    // Check if custom headers are set
    const customHeaders = schemaDetail.headers // Moved this line up to the loop
    // Check if custom headers are set and are of type string
    if (customHeaders && typeof customHeaders === "string") {
      let parsedCustomHeaders = JSON.parse(customHeaders) as Record<
        string,
        string
      >

      headers = {
        ...headers,
        ...parsedCustomHeaders
      }
    }

    const fullUrl = schemaDetail.url + path

    const bodyContent = parsedArgs.requestBody || parsedArgs

    const requestInit = {
      method: "POST",
      headers,
      body: JSON.stringify(bodyContent) // Use the extracted requestBody or the entire parsedArgs
    }

    const response = await fetch(fullUrl, requestInit)

    if (!response.ok) {
      data = {
        error: response.statusText
      }
    } else {
      data = await response.json()
    }
  } else {
    // If the type is set to query
    const queryParams = new URLSearchParams(parsedArgs.parameters).toString()
    const fullUrl =
      schemaDetail.url + path + (queryParams ? "?" + queryParams : "")

    let headers = {}

    // Check if custom headers are set
    const customHeaders = schemaDetail.headers
    if (customHeaders && typeof customHeaders === "string") {
      headers = JSON.parse(customHeaders)
    }

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers
    })

    if (!response.ok) {
      console.error("Error:", response.statusText, response.status)
      throw new Error(`Error: ${response.statusText}`)
    } else {
      data = await response.json()
    }
  }

  return { result: data, resultProcessingMode }
}

export async function buildSchemaDetails(selectedTools: Tables<"tools">[]) {
  let allTools: OpenAI.Chat.Completions.ChatCompletionTool[] = []
  let allRouteMaps = {}
  let schemaDetails = []

  for (const selectedTool of selectedTools) {
    try {
      const convertedSchema = await openapiToFunctions(
        JSON.parse(selectedTool.schema as string)
      )
      const tools = convertedSchema.functions || []
      allTools = allTools.concat(tools)

      const routeMap = convertedSchema.routes.reduce(
        (map: Record<string, string>, route) => {
          map[route.path.replace(/{(\w+)}/g, ":$1")] = route.operationId
          return map
        },
        {}
      )

      allRouteMaps = { ...allRouteMaps, ...routeMap }

      const requestInBodyMap = convertedSchema.routes.reduce(
        (previousValue: { [key: string]: boolean }, currentValue) => {
          previousValue[currentValue.path] = !!currentValue.requestInBody
          return previousValue
        },
        {}
      )

      schemaDetails.push({
        title: convertedSchema.info.title,
        description: convertedSchema.info.description,
        url: convertedSchema.info.server,
        headers: selectedTool.custom_headers,
        routeMap,
        requestInBodyMap
      })
    } catch (error: any) {
      console.error("Error converting schema", error)
    }
  }
  return { schemaDetails, allTools, allRouteMaps }
}
