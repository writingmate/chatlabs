"use client"

import { FC, useState, useContext } from "react"
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
import { createApplication } from "@/db/applications"
import { Application, LLM } from "@/types"
import { toast } from "sonner"
import { Checkbox } from "../ui/checkbox"
import { Tables } from "@/supabase/types"
import { MultiSelect } from "../ui/multi-select" // Assuming you have a MultiSelect component
import { IconCircleCheckFilled } from "@tabler/icons-react"

interface CreateApplicationProps {
  onApplicationCreated: (application: Application) => void
}

export const CreateApplication: FC<CreateApplicationProps> = ({
  onApplicationCreated
}) => {
  const { profile, selectedWorkspace, tools, allModels } =
    useContext(ChatbotUIContext)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [sharing, setSharing] = useState<Application["sharing"]>("private")
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [selectedModels, setSelectedModels] = useState<LLM[]>([])

  const handleCreate = async () => {
    if (!profile || !selectedWorkspace) return

    try {
      const newApplication: Partial<Tables<"applications">> = {
        user_id: profile.user_id,
        workspace_id: selectedWorkspace.id,
        name,
        description,
        sharing,
        folder_id: null,
        created_at: new Date().toISOString(),
        updated_at: null
      }

      const createdApplication = await createApplication(
        newApplication as Tables<"applications">,
        [], // files
        selectedTools
        // selectedModels.map(model => model.modelId)
      )
      onApplicationCreated(createdApplication)
      toast.success("Application created successfully")
      // Reset form
      setName("")
      setDescription("")
      setSharing("private")
      setSelectedTools([])
      setSelectedModels([])
    } catch (error) {
      console.error("Error creating application:", error)
      toast.error("Failed to create application")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter application name"
          required
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter application description"
          required
        />
      </div>
      <div>
        <label
          htmlFor="sharing"
          className="block text-sm font-medium text-gray-700"
        >
          Sharing
        </label>
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
        <label className="block text-sm font-medium text-gray-700">Tools</label>
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
        <label
          htmlFor="models"
          className="block text-sm font-medium text-gray-700"
        >
          Models
        </label>
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
      <Button onClick={handleCreate} disabled={!name || !description}>
        Create Application
      </Button>
    </div>
  )
}
