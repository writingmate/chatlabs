"use client"

import { FC, useState, useContext, useEffect } from "react"
import { Button } from "../ui/button"
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
import { updateApplication } from "@/db/applications"
import { Application, LLM } from "@/types"
import { toast } from "sonner"
import { Tables } from "@/supabase/types"
import { MultiSelect } from "../ui/multi-select"
import { APPLICATION_TYPES } from "@/types/application-types"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { Label } from "@/components/ui/label"
import { Description } from "../ui/description"

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
  application: Tables<"applications">
  onUpdateApplication: (application: Tables<"applications">) => void
  onCancel: () => void
}

export const UpdateApplication: FC<UpdateApplicationProps> = ({
  application,
  onUpdateApplication,
  onCancel
}) => {
  const { profile, selectedWorkspace, tools, allModels } =
    useContext(ChatbotUIContext)
  const [name, setName] = useState(application.name)
  const [description, setDescription] = useState(application.description)
  const [sharing, setSharing] = useState<Application["sharing"]>(
    application.sharing
  )
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [selectedModels, setSelectedModels] = useState<LLM[]>([])
  const [theme, setTheme] = useState(application.theme || "light")
  const [applicationType, setApplicationType] = useState(
    application.application_type || "web_app"
  )

  useEffect(() => {
    // Fetch current tools and models for this application
    const fetchApplicationDetails = async () => {
      // Fetch tools
      // const appTools = await getApplicationTools(application.id)
      // setSelectedTools(appTools.map(tool => tool.id))
      // Fetch models
      // const appModels = await getApplicationModels(application.id)
      // setSelectedModels(appModels)
    }

    fetchApplicationDetails()
  }, [application.id])

  const handleUpdate = async () => {
    if (!profile || !selectedWorkspace) return

    try {
      const updatedApplication: Partial<Tables<"applications">> = {
        name,
        description,
        sharing,
        updated_at: new Date().toISOString(),
        application_type: applicationType,
        theme: applicationType === "web_app" ? theme : undefined,
        user_id: profile.user_id // Make sure to include the user_id
      }

      const platformTools = tools.filter(tool => tool.sharing === "platform")
      const selectedPlatformTools = selectedTools.filter(tool =>
        platformTools.find(platformTool => platformTool.id === tool)
      )
      const filteredSelectedTools = selectedTools.filter(
        tool =>
          !selectedPlatformTools.find(platformTool => platformTool === tool)
      )

      const result = await updateApplication(
        application.id,
        updatedApplication as Tables<"applications">,
        filteredSelectedTools,
        selectedPlatformTools,
        selectedModels
      )

      onUpdateApplication(result)
      toast.success("Application updated successfully")
    } catch (error) {
      console.error("Error updating application:", error)
      toast.error("Failed to update application")
    }
  }

  const appTypeTooltips = {
    web_app:
      "Web Apps enable theme selection, while other types have predefined layouts.",
    chatbot: "Chatbots have a predefined layout with a chat interface.",
    game: "Games have a predefined layout with a game interface.",
    free_form: "Free form has no predefined layout."
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Application Type</Label>
        <Description>
          Choose the type of application you want to create. This determines the
          layout and features available.
        </Description>
        <Tabs value={applicationType} onValueChange={setApplicationType}>
          <TabsList className="grid w-full grid-cols-4">
            {APPLICATION_TYPES.map(type => (
              <TabsTrigger key={type.value} value={type.value}>
                <WithTooltip
                  trigger={<>{type.label}</>}
                  display={
                    <p className="max-w-xs">
                      {
                        appTypeTooltips[
                          type.value as keyof typeof appTypeTooltips
                        ]
                      }
                    </p>
                  }
                />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div>
        <Label htmlFor="name">Name</Label>
        <Description>
          Enter a unique and descriptive name for your application.
        </Description>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter application name"
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Description>
          Provide a brief overview of your application{"'"}s purpose and
          functionality.
        </Description>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter application description"
        />
      </div>
      <div>
        <Label htmlFor="sharing">Sharing</Label>
        <Description>
          Choose who can access your application. Private: Only you. Public:
          Anyone with the link.
        </Description>
        <Select
          value={sharing}
          onValueChange={value => setSharing(value as Application["sharing"])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sharing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Tools</Label>
        <Description>
          Select tools to enhance your application{"'"}s capabilities.
        </Description>
        <MultiSelect
          selectedOptions={selectedTools.map(tool => ({
            value: tool,
            label: tool
          }))}
          onChange={selected => setSelectedTools(selected.map(s => s.value))}
          options={tools.map(tool => ({ value: tool.id, label: tool.name }))}
          placeholder="Select tools"
        />
      </div>
      <div>
        <Label htmlFor="models">Models</Label>
        <Description>
          Choose AI models to use in your application for various tasks.
        </Description>
        <MultiSelect
          selectedOptions={selectedModels.map(model => ({
            value: model.modelId,
            label: model.modelName
          }))}
          onChange={selected =>
            setSelectedModels(
              selected.map(
                s => ({ modelId: s.value, modelName: s.label }) as LLM
              )
            )
          }
          options={allModels.map(model => ({
            value: model.modelId,
            label: model.modelName
          }))}
          placeholder="Select models"
        />
      </div>
      {applicationType === "web_app" && (
        <div>
          <Label htmlFor="theme">Theme</Label>
          <Description>
            Select a visual theme for your web app. Only available for Web App
            type applications.
          </Description>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {themes.map(t => (
                <SelectItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-x-2">
        <Button onClick={handleUpdate} disabled={!name}>
          Update Application
        </Button>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  )
}
