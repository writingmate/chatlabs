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
import { ApplicationThemeSelect } from "./application-theme-select"

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

  const [isCreatingTool, setIsCreatingTool] = useState(false)

  const handleChange = useCallback(
    (field: string, value: any) => {
      const updatedApplication = { ...application, [field]: value }
      onUpdateApplication(updatedApplication)
    },
    [onUpdateApplication, application]
  )

  const handleCreateTool = useCallback(() => {
    setIsCreatingTool(true)
  }, [])

  console.log("application", application.tools)

  const areToolsPublic = application.tools.every(tool =>
    ["platform", "public", "link"].includes(tool.sharing)
  )

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <Label>Type</Label>
        <RadioGroup
          orientation="horizontal"
          value={application.application_type || "web_app"}
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
          value={application.name}
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
          value={application.description}
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
          value={application.sharing || "private"}
          onValueChange={value => handleChange("sharing", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a sharing option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">
              <span>Private</span>{" "}
              <span className="text-muted-foreground">Visible to only you</span>
            </SelectItem>
            <SelectItem value="public">
              <span>Public</span>{" "}
              <span className="text-muted-foreground">Visible to everyone</span>
            </SelectItem>
            <SelectItem value="link">
              <span>Link</span>{" "}
              <span className="text-muted-foreground">
                Visible to anyone with the link
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex space-x-4">
        <div>
          <Label>Tools</Label>
          <MultiSelect
            selectedOptions={application.tools.map(tool => ({
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
            selectedOptions={application.models.map(modelId => {
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

      {application.application_type === "web_app" && (
        <div>
          <Label htmlFor="theme">Theme</Label>
          <ApplicationThemeSelect
            application={application as Tables<"applications">}
            handleChange={handleChange}
          />
          <Description>
            Select a visual theme for your web app. Only available for Web App
            type applications.
          </Description>
        </div>
      )}

      {!areToolsPublic && (
        <Callout variant="warning">
          <CalloutTitle>Warning</CalloutTitle>
          <CalloutDescription>
            Your one of the tools is private. You need to set all tools to
            public or link to publish your application.
          </CalloutDescription>
        </Callout>
      )}

      {isCreatingTool && (
        <CreateTool isOpen={isCreatingTool} onOpenChange={setIsCreatingTool} />
      )}
    </div>
  )
}
