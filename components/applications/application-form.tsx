import { useState, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChatbotUIContext } from "@/context/context"
import { createApplication } from "@/db/applications"
import { Application } from "@/types"
import { toast } from "sonner"

export function ApplicationForm({ onClose }: { onClose: () => void }) {
  const { profile, selectedWorkspace, setApplications } =
    useContext(ChatbotUIContext)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile || !selectedWorkspace) return

    const newApplication: Partial<Application> = {
      user_id: profile.user_id,
      workspace_id: selectedWorkspace.id,
      name,
      description,
      sharing: "private"
    }

    try {
      const createdApplication = await createApplication(
        newApplication as any,
        selectedFiles,
        selectedTools
      )
      setApplications(prev => [...prev, createdApplication])
      toast.success("Application created successfully")
      onClose()
    } catch (error) {
      console.error("Error creating application:", error)
      toast.error("Failed to create application")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>
      {/* Add file selection component */}
      {/* Add tool selection component */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Application</Button>
      </div>
    </form>
  )
}
