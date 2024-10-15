import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { TOOL_DESCRIPTION_MAX, TOOL_NAME_MAX } from "@/db/limits"
import { validateOpenAPI } from "@/lib/openapi-conversion"
import { Tables } from "@/supabase/types"
import { IconBolt, IconPuzzle } from "@tabler/icons-react"
import { FC, useState } from "react"
import {
  SIDEBAR_ITEM_ICON_SIZE,
  SIDEBAR_ITEM_ICON_STROKE,
  SidebarItem
} from "../all/sidebar-display-item"
import {
  SelectItem,
  SelectValue,
  Select,
  SelectContent,
  SelectTrigger
} from "@/components/ui/select"
import { Description } from "@/components/ui/description"

interface ToolItemProps {
  tool: Tables<"tools">
}

export const ToolItem: FC<ToolItemProps> = ({ tool }) => {
  const [name, setName] = useState(tool.name)
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState(tool.description)
  const [url, setUrl] = useState(tool.url)
  const [sharing, setSharing] = useState(tool.sharing)
  const [customHeaders, setCustomHeaders] = useState(
    tool.custom_headers as string
  )
  const [schema, setSchema] = useState(tool.schema as string)
  const [schemaError, setSchemaError] = useState("")

  return (
    <SidebarItem
      item={tool}
      isTyping={isTyping}
      contentType="tools"
      name="plugins"
      icon={
        <IconPuzzle
          size={SIDEBAR_ITEM_ICON_SIZE}
          stroke={SIDEBAR_ITEM_ICON_STROKE}
          className="text-muted-foreground size-5"
        />
      }
      updateState={{
        name,
        description,
        url,
        sharing,
        custom_headers: customHeaders,
        schema
      }}
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="Plugin name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={TOOL_NAME_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>

            <Input
              placeholder="Plugin description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={TOOL_DESCRIPTION_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Sharing</Label>

            <Select onValueChange={value => setSharing(value)} value={sharing}>
              <SelectTrigger>
                <SelectValue placeholder="Select a sharing option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <span>Private</span>{" "}
                  <span className="text-muted-foreground">
                    Visible to only you
                  </span>
                </SelectItem>
                <SelectItem value="public">
                  <span>Public</span>{" "}
                  <span className="text-muted-foreground">
                    Visible to everyone
                  </span>
                </SelectItem>
                <SelectItem value="link">
                  <span>Link</span>{" "}
                  <span className="text-muted-foreground">
                    Visible to anyone with the link
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Description>
              Select who can see this plugin. Link or Public plugins is required
              if you want to publish an app.
            </Description>
          </div>

          <div className="space-y-1">
            <Label>Custom Headers</Label>

            <TextareaAutosize
              placeholder={`{"X-api-key": "1234567890"}`}
              value={customHeaders}
              onValueChange={setCustomHeaders}
              minRows={1}
            />
          </div>

          <div className="space-y-1">
            <Label>Schema</Label>

            <TextareaAutosize
              placeholder={`{
                "openapi": "3.1.0",
                "info": {
                  "title": "Get weather data",
                  "description": "Retrieves current weather data for a location.",
                  "version": "v1.0.0"
                },
                "servers": [
                  {
                    "url": "https://weather.example.com"
                  }
                ],
                "paths": {
                  "/location": {
                    "get": {
                      "description": "Get temperature for a specific location",
                      "operationId": "GetCurrentWeather",
                      "parameters": [
                        {
                          "name": "location",
                          "in": "query",
                          "description": "The city and state to retrieve the weather for",
                          "required": true,
                          "schema": {
                            "type": "string"
                          }
                        }
                      ],
                      "deprecated": false
                    }
                  }
                },
                "components": {
                  "schemas": {}
                }
              }`}
              value={schema}
              onValueChange={value => {
                setSchema(value)

                try {
                  const parsedSchema = JSON.parse(value)
                  validateOpenAPI(parsedSchema)
                    .then(() => setSchemaError("")) // Clear error if validation is successful
                    .catch(error => setSchemaError(error.message)) // Set specific validation error message
                } catch (error) {
                  setSchemaError("Invalid JSON format") // Set error for invalid JSON format
                }
              }}
              minRows={15}
            />

            <div className="text-xs text-red-500">{schemaError}</div>
          </div>
        </>
      )}
    />
  )
}
