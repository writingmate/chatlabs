"use client"

import {
  FC,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo
} from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { ChatbotUIContext } from "@/context/context"
import { LLMID } from "@/types"
import { Tables, TablesInsert } from "@/supabase/types"
import { MultiSelect } from "../ui/multi-select"
import { APPLICATION_TYPES } from "@/types/application-types"
import { Label } from "@/components/ui/label"
import { Description } from "../ui/description"
import { RadioGroupItem, RadioGroup } from "../ui/radio-group"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { IconPlus, IconRefresh } from "@tabler/icons-react"
import {
  Callout,
  CalloutIcon,
  CalloutTitle,
  CalloutDescription
} from "../ui/callout"
import { IconAlertTriangle } from "@tabler/icons-react"
import { CreateTool } from "../sidebar/items/tools/create-tool"

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset"
]

interface UpdateApplicationProps {
  className?: string
  application: TablesInsert<"applications"> & {
    models: LLMID[]
    tools: Tables<"tools">[]
  }
  onUpdateApplication: (
    application: TablesInsert<"applications"> & {
      tools: Tables<"tools">[]
      models: LLMID[]
    }
  ) => void
  isCreating?: boolean
}

export const UpdateApplication: FC<UpdateApplicationProps> = ({
  className,
  application,
  onUpdateApplication,
  isCreating = false
}) => {
  const { tools, allModels } = useContext(ChatbotUIContext)

  const [localApplication, setLocalApplication] = useState(application)
  const [isCreatingTool, setIsCreatingTool] = useState(false)

  useEffect(() => {
    setLocalApplication(application)
  }, [application])

  const handleChange = useCallback(
    (field: string, value: any) => {
      const updatedApplication = { ...application, [field]: value }
      onUpdateApplication(updatedApplication)
    },
    [onUpdateApplication]
  )

  const handleCreateTool = useCallback(() => {
    setIsCreatingTool(true)
  }, [])

  // Determine if tools or models have changed
  const hasChanges = useMemo(() => {
    const toolsChanged = !(
      application.tools.length === localApplication.tools.length &&
      application.tools.every(
        (tool, index) => tool.id === localApplication.tools[index].id
      )
    )
    const modelsChanged = !(
      application.models.length === localApplication.models.length &&
      application.models.every(
        (modelId, index) => modelId === localApplication.models[index]
      )
    )
    return toolsChanged || modelsChanged
  }, [application, localApplication])

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <Label>Type</Label>
        <RadioGroup
          orientation="horizontal"
          value={localApplication.application_type || "web_app"}
          onValueChange={value => handleChange("application_type", value)}
          className="flex space-x-2"
        >
          {APPLICATION_TYPES.map(type => (
            <div
              key={type.value}
              className="flex items-center space-x-2 text-sm"
            >
              <RadioGroupItem key={type.value} value={type.value} />
              <label>{type.label}</label>
            </div>
          ))}
        </RadioGroup>
        <Description>
          Choose the type of application you want to create. This determines the
          layout and features available.
        </Description>
      </div>

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={localApplication.name}
          onChange={e => handleChange("name", e.target.value)}
          placeholder="Enter application name"
          required
        />
        <Description>
          Enter a unique and descriptive name for your application.
        </Description>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={localApplication.description}
          onChange={e => handleChange("description", e.target.value)}
          placeholder="Enter application description"
        />
        <Description>
          Provide a brief overview of your application{"'"}s purpose and
          functionality.
        </Description>
      </div>

      <div>
        <Label htmlFor="sharing">Sharing</Label>
        <Select
          value={localApplication.sharing || "private"}
          onValueChange={value => handleChange("sharing", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sharing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectContent>
        </Select>
        <Description>
          Choose who can access your application. Private: Only you. Public:
          Anyone with the link.
        </Description>
      </div>

      <div className="flex space-x-4">
        <div>
          <Label>Tools</Label>
          <MultiSelect
            selectedOptions={localApplication.tools.map(tool => ({
              value: tool.id,
              label: tool.name
            }))}
            onChange={selected => {
              const selectedTools = selected
                .map(s => tools.find(tool => tool.id === s.value))
                .filter(tool => tool) as Tables<"tools">[]

              handleChange("tools", selectedTools)
            }}
            options={tools.map(tool => ({ value: tool.id, label: tool.name }))}
            placeholder="Select tools"
            footer={
              <Button
                size="sm"
                variant="ghost"
                className="text-md flex w-full items-center justify-between font-normal"
                onClick={handleCreateTool}
              >
                <span>Create new tool</span>
                <IconPlus size={20} />
              </Button>
            }
          />
          <Description>
            Select tools to enhance your application{"'"}s capabilities.
          </Description>
        </div>

        <div>
          <Label htmlFor="models">Models</Label>
          <MultiSelect
            selectedOptions={localApplication.models.map(modelId => {
              const model = allModels.find(m => m.modelId === modelId)
              return {
                value: modelId,
                label: model ? model.modelName : modelId
              }
            })}
            onChange={selected => {
              handleChange(
                "models",
                selected.map(s => s.value)
              )
            }}
            options={allModels.map(model => ({
              value: model.modelId,
              label: model.modelName
            }))}
            placeholder="Select models"
          />
          <Description>
            Choose AI models to use in your application for various tasks.
          </Description>
        </div>
      </div>

      {localApplication.application_type === "web_app" && (
        <div>
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={localApplication.theme || "light"}
            onValueChange={value => handleChange("theme", value)}
          >
            <SelectTrigger className="capitalize">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {themes.map(t => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Description>
            Select a visual theme for your web app. Only available for Web App
            type applications.
          </Description>
        </div>
      )}

      {!isCreating && application.id && hasChanges && (
        <Callout>
          <CalloutDescription className="flex items-center justify-between space-x-2">
            <div className="flex items-center">
              Sync model and tools changes with application code.
            </div>
            <Button size="sm" variant="outline">
              <IconRefresh className="mr-2 size-4" />
              Update app
            </Button>
          </CalloutDescription>
        </Callout>
      )}

      {isCreatingTool && (
        <CreateTool isOpen={isCreatingTool} onOpenChange={setIsCreatingTool} />
      )}
    </div>
  )
}
