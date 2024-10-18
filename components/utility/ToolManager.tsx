import { useState, useEffect, useContext } from "react"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { TOOL_DESCRIPTION_MAX, TOOL_NAME_MAX } from "@/db/limits"
import { validateOpenAPI } from "@/lib/openapi-conversion"
import {
  IconPuzzle,
  IconPlus,
  IconTrash,
  IconEdit,
  IconArrowLeft
} from "@tabler/icons-react"
import { createTool, updateTool, deleteTool } from "@/db/tools"
import { useAuth } from "@/context/auth"
import { SearchInput } from "../ui/search-input"
import { toast } from "sonner"

export const ToolManager = () => {
  const { user } = useAuth()
  const { tools, setTools, selectedWorkspace } = useContext(ChatbotUIContext)
  const [selectedTool, setSelectedTool] = useState<Tables<"tools"> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [sharing, setSharing] = useState<"private" | "public" | "link">(
    "private"
  )
  const [customHeaders, setCustomHeaders] = useState("")
  const [schema, setSchema] = useState("")
  const [schemaError, setSchemaError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (selectedTool) {
      setName(selectedTool.name)
      setDescription(selectedTool.description)
      setUrl(selectedTool.url)
      setSharing(selectedTool.sharing as "private" | "public" | "link")
      setCustomHeaders(
        typeof selectedTool.custom_headers === "string"
          ? selectedTool.custom_headers
          : JSON.stringify(selectedTool.custom_headers)
      )
      setSchema(selectedTool.schema as string)
    }
  }, [selectedTool])

  if (!user || !selectedWorkspace) return null

  const resetForm = () => {
    setSelectedTool(null)
    setIsEditing(false)
    setIsCreating(false)
    setName("")
    setDescription("")
    setUrl("")
    setSharing("private")
    setCustomHeaders("")
    setSchema("")
    setSchemaError("")
  }

  const handleCreate = async () => {
    try {
      const newTool = await createTool(
        {
          user_id: user!.id,
          name,
          description,
          url,
          sharing,
          custom_headers: customHeaders,
          schema
        },
        selectedWorkspace!.id
      )
      setTools([...tools, newTool])
      resetForm()
      toast.success("Plugin created successfully")
    } catch (error) {
      toast.error("Error creating plugin")
      console.error("Error creating tool:", error)
    }
  }

  const handleUpdate = async () => {
    if (!selectedTool) return
    try {
      const updatedTool = await updateTool(selectedTool.id, {
        name,
        description,
        url,
        sharing,
        custom_headers: customHeaders,
        schema
      })
      setTools(
        tools.map(tool => (tool.id === updatedTool.id ? updatedTool : tool))
      )
      resetForm()
      toast.success("Plugin updated successfully")
    } catch (error) {
      console.error("Error updating tool:", error)
      toast.error("Error updating plugin")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTool(id)
      setTools(tools.filter(tool => tool.id !== id))
      resetForm()
      toast.success("Plugin deleted successfully")
    } catch (error) {
      console.error("Error deleting tool:", error)
      toast.error("Error deleting plugin")
    }
  }

  const validateSchema = (value: string) => {
    try {
      const parsedSchema = JSON.parse(value)
      validateOpenAPI(parsedSchema)
        .then(() => setSchemaError(""))
        .catch(error => setSchemaError(error.message))
    } catch (error) {
      setSchemaError("Invalid JSON format")
    }
  }

  return (
    <div className="space-y-2">
      {!isEditing && !isCreating ? (
        <>
          {/* Tool List */}
          <div className="flex items-center justify-between space-x-2">
            <SearchInput
              className="flex-1 grow"
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
            <Button onClick={() => setIsCreating(true)}>
              <IconPlus size={18} className="mr-2" />
              Create New Plugin
            </Button>
          </div>
          <div className="space-y-1">
            {tools
              .filter(tool =>
                tool.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(tool => (
                <div
                  onClick={() => {
                    if (tool.sharing === "platform") {
                      toast.error(
                        "This is a ChatLabs internal plugin and cannot be changed"
                      )
                      return
                    }
                    setSelectedTool(tool)
                    setIsEditing(true)
                  }}
                  key={tool.id}
                  className="border-input flex h-10 cursor-pointer items-center justify-between rounded-md border pl-3 text-sm hover:opacity-50"
                >
                  <span className="flex items-center">
                    <IconPuzzle
                      stroke={1.5}
                      size={18}
                      className="text-muted-foreground mr-2"
                    />
                    {tool.name}
                  </span>

                  {tool.sharing !== "platform" && (
                    <div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTool(tool)
                          setIsEditing(true)
                        }}
                      >
                        <IconEdit
                          stroke={1.5}
                          size={18}
                          className="text-muted-foreground"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tool.id)}
                      >
                        <IconTrash
                          stroke={1.5}
                          size={18}
                          className="text-muted-foreground"
                        />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </>
      ) : (
        /* Tool Form */
        <form
          onSubmit={e => {
            e.preventDefault()
            isEditing ? handleUpdate() : handleCreate()
          }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="link"
              onClick={resetForm}
              className="text-muted-foreground px-0"
            >
              <IconArrowLeft size={18} className="mr-2" />
              Back to List
            </Button>
            <Button type="submit">
              {isEditing ? "Update Plugin" : "Create Plugin"}
            </Button>
          </div>
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={TOOL_NAME_MAX}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={TOOL_DESCRIPTION_MAX}
            />
          </div>

          {/* <div className="space-y-1">
                        <Label htmlFor="url">URL</Label>
                        <Input
                            id="url"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            required
                        />
                    </div> */}

          <div className="space-y-1">
            <Label htmlFor="sharing">Sharing</Label>
            <Select
              value={sharing}
              onValueChange={value =>
                setSharing(value as "private" | "public" | "link")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="customHeaders">Custom Headers</Label>
            <TextareaAutosize
              value={customHeaders}
              onValueChange={setCustomHeaders}
              placeholder={`{"X-api-key": "1234567890"}`}
              minRows={2}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="schema">Schema</Label>
            <TextareaAutosize
              value={schema}
              onValueChange={value => {
                setSchema(value)
                validateSchema(value)
              }}
              placeholder="Paste your OpenAPI schema here..."
              minRows={7}
            />
            {schemaError && (
              <p className="text-sm text-red-500">{schemaError}</p>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
