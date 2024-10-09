import { PlatformTool } from "@/types/platformTools"
import { platformToolList } from "../platformToolsList"
import { Tables } from "@/supabase/types"
const generateToolSchema = (tool: any) => {
  const paths = tool.toolsFunctions.reduce((acc: any, toolFunction: any) => {
    let responses = {}
    switch (toolFunction.responseSchema?.type) {
      case "object":
        responses = {
          200: {
            content: {
              "application/json": {
                schema: toolFunction.responseSchema
              }
            }
          }
        }
        break
      case "string":
        responses = {
          200: {
            content: {
              "text/plain": {
                description: toolFunction.responseSchema.description
              }
            }
          }
        }
        break
      default:
        break
    }

    acc[`/${toolFunction.id}`] = {
      get: {
        description: toolFunction.description,
        operationId: `${tool.toolName}__${toolFunction.id}`,
        parameters: toolFunction.parameters,
        responses: toolFunction.responseSchema
          ? {
              200: {
                content: {
                  "application/json": {
                    schema: toolFunction.responseSchema
                  }
                }
              }
            }
          : {},
        deprecated: false
      }
    }
    return acc
  }, {})

  return JSON.stringify({
    openapi: "3.1.0",
    info: {
      title: tool.name,
      description: tool.description,
      version: tool.version
    },
    servers: [
      {
        url: "local://executor"
      }
    ],
    paths: paths,
    components: {
      schemas: {}
    }
  })
}

const getToolIds = (id: string): string[] => id.split("__")

export const platformToolDefinition = (tool: PlatformTool) => {
  return {
    id: tool.id,
    name: tool.name,
    description: tool.description,
    sharing: "platform",
    folder_id: null,
    user_id: "",
    created_at: new Date("2023-03-19T00:00:00.000Z").toISOString(),
    custom_headers: {},
    updated_at: new Date("2023-03-19T00:00:00.000Z").toISOString(),
    url: "",
    schema: generateToolSchema(tool) // Assuming "FetchDataFromUrl" is the function ID for all tools for simplicity
  } as Tables<"tools">
}

export const platformToolDefinitions = () => {
  return platformToolList.map(platformToolDefinition) as Tables<"tools">[]
}

export const platformToolFunctionSpec = (functionName: string) => {
  const [toolName, toolFunctionId] = getToolIds(functionName)
  const tool = platformToolList.find(tool => tool.toolName === toolName)
  if (!tool) {
    return null
  }
  const toolFunction = tool.toolsFunctions.find(
    (toolFunction: any) => toolFunction.id === toolFunctionId
  )

  console.log("toolFunction", toolFunction)

  if (!toolFunction) {
    return null
  }
  return toolFunction
}

export const platformToolFunction = (functionName: string): Function => {
  const toolFunctionSpec = platformToolFunctionSpec(functionName)
  console.log("toolFunctionSpec", toolFunctionSpec)

  return toolFunctionSpec
    ? toolFunctionSpec.toolFunction
    : () => Promise.resolve("Tool function not found.")
}
