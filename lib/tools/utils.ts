import { getApplicationTools } from "@/db/applications"
import { Tables } from "@/supabase/types"
import { LogitsProcessor } from "@xenova/transformers/types/utils/generation"
import { FunctionCallPayload } from "ai"
import OpenAI from "openai"

import { logger } from "@/lib/logger"
import { openapiToFunctions } from "@/lib/openapi-conversion"
import { platformToolFunctionSpec } from "@/lib/platformTools/utils/platformToolsUtils"

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
  logger.debug(`Executing tool function: ${functionName}`)

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
    logger.error(`Function ${functionName} not found in any schema`)
    throw new Error(`Function ${functionName} not found in any schema`)
  }

  // Reroute to local executor for local tools
  if (schemaDetail.url === "local://executor") {
    logger.debug(`Rerouting to local executor for function: ${functionName}`)
    const toolFunctionSpec = platformToolFunctionSpec(functionName)
    if (!toolFunctionSpec) {
      logger.error(`Function ${functionName} not found`)
      throw new Error(`Function ${functionName} not found`)
    }

    if (applicationId) {
      logger.debug(
        `Checking application-specific tools for application ID: ${applicationId}`
      )
      const applicationTools = await getApplicationTools(applicationId)
      const applicationToolIds = applicationTools.map(tool => tool?.id)

      if (!applicationToolIds.includes(toolFunctionSpec.id)) {
        logger.error(
          `Function ${functionName} is not allowed for this application`
        )
        throw new Error(
          `Function ${functionName} is not allowed for this application`
        )
      }
    }

    const result = await toolFunctionSpec.toolFunction(parsedArgs)
    logger.debug(`Local tool function executed successfully: ${functionName}`)
    return {
      result,
      resultProcessingMode: toolFunctionSpec.resultProcessingMode
    }
  }

  const pathTemplate = Object.keys(schemaDetail.routeMap).find(
    key => schemaDetail.routeMap[key] === functionName
  )

  if (!pathTemplate) {
    logger.error(`Path for function ${functionName} not found`)
    throw new Error(`Path for function ${functionName} not found`)
  }

  const path = pathTemplate.replace(/:(\w+)/g, (_, paramName) => {
    const value = parsedArgs.parameters[paramName]
    if (!value) {
      logger.error(
        `Parameter ${paramName} not found for function ${functionName}`
      )
      throw new Error(
        `Parameter ${paramName} not found for function ${functionName}`
      )
    }
    return encodeURIComponent(value)
  })

  if (!path) {
    logger.error(`Path for function ${functionName} not found`)
    throw new Error(`Path for function ${functionName} not found`)
  }

  logger.debug(`Constructed path for function ${functionName}: ${path}`)

  // Determine if the request should be in the body or as a query
  const isRequestInBody = schemaDetail.requestInBodyMap[path]
  let data = {}

  logger.debug({ schemaDetail }, `Schema detail for function: ${functionName}`)

  if (isRequestInBody) {
    logger.debug(`Sending request in body for function: ${functionName}`)
    let headers = {
      "Content-Type": "application/json"
    }

    const customHeaders = schemaDetail.headers
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
      body: JSON.stringify(bodyContent)
    }

    const response = await fetch(fullUrl, requestInit)

    if (!response.ok) {
      logger.error(`Error in response: ${response.statusText}`)
      data = {
        error: response.statusText
      }
    } else {
      data = await response.json()
      logger.debug(
        `Response received successfully for function: ${functionName}`
      )
    }
  } else {
    logger.debug(`Sending request as query for function: ${functionName}`)
    const queryParams = new URLSearchParams(parsedArgs.parameters).toString()
    const fullUrl =
      schemaDetail.url + path + (queryParams ? "?" + queryParams : "")

    let headers = {}

    const customHeaders = schemaDetail.headers
    if (customHeaders && typeof customHeaders === "string") {
      headers = JSON.parse(customHeaders)
    }

    logger.debug({ fullUrl, headers }, `Fetching URL: ${functionName}`)

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers
    })

    if (!response.ok) {
      logger.error(`Error in response: ${response.statusText}`)
      throw new Error(`Error: ${response.statusText}`)
    } else {
      data = await response.json()
      logger.debug(
        `Response received successfully for function: ${functionName}`
      )
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
