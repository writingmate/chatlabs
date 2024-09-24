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
import { getApplicationTools, updateApplication } from "@/db/applications"
import { Application, LLM, LLMID } from "@/types"
import { toast } from "sonner"
import { Tables } from "@/supabase/types"
import { MultiSelect } from "../ui/multi-select"
import { APPLICATION_TYPES } from "@/types/application-types"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { Label } from "@/components/ui/label"
import { Description } from "../ui/description"
import { RadioGroupItem, RadioGroup } from "../ui/radio-group"

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
  application: Tables<"applications"> & {
    models: LLMID[]
    tools: Tables<"tools">[]
  }
  onUpdateApplication: (
    application: Tables<"applications"> & {
      tools: Tables<"tools">[]
      models: LLMID[]
    }
  ) => void
}

export const UpdateApplication: FC<UpdateApplicationProps> = ({
  application,
  onUpdateApplication
}) => {
  const { tools, allModels } = useContext(ChatbotUIContext)
  const [name, setName] = useState(application.name)
  const [description, setDescription] = useState(application.description)
  const [sharing, setSharing] = useState<Application["sharing"]>(
    application.sharing
  )
  const [selectedTools, setSelectedTools] = useState<string[]>([
    ...application.tools.map(tool => tool.id)
  ])
  const [selectedModels, setSelectedModels] = useState<LLM[]>(
    application.models?.map(
      model => allModels.find(m => m.modelId === model) || []
    ) as LLM[]
  )
  const [theme, setTheme] = useState(application.theme || "light")
  const [applicationType, setApplicationType] = useState(
    application.application_type || "web_app"
  )

  useEffect(() => {
    onUpdateApplication({
      ...application,
      name,
      description,
      sharing,
      tools: selectedTools
        .map(tool => tools.find(t => t.id === tool))
        .filter(Boolean) as Tables<"tools">[],
      models: selectedModels.map(model => model.modelId),
      theme,
      application_type: applicationType
    })
  }, [])

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <Label>Application Type</Label>
        <Description>
          Choose the type of application you want to create. <br />
          This determines the layout and features available.
        </Description>
        <RadioGroup
          orientation="horizontal"
          value={applicationType}
          onValueChange={setApplicationType}
          className="flex space-x-2"
        >
          {APPLICATION_TYPES.map(type => (
            <div
              key={type.value}
              className="flex items-center space-x-2 text-sm"
            >
              <RadioGroupItem
                key={type.value}
                value={type.value}
              ></RadioGroupItem>
              <label>{type.label}</label>
            </div>
          ))}
        </RadioGroup>
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
        </div>
      )}
    </div>
  )
}
