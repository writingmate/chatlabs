"use client"

import { FC, useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import { ChatbotUIContext } from "@/context/context"
import { Button } from "../ui/button"
import {
  getApplicationsByWorkspaceId,
  deleteApplication
} from "@/db/applications"
import { Loader } from "@/components/ui/loader"
import { Tables } from "@/supabase/types"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { IconPlus } from "@tabler/icons-react"

export const ApplicationView: FC = () => {
  const router = useRouter()
  const { selectedWorkspace } = useContext(ChatbotUIContext)
  const [applications, setApplications] = useState<Tables<"applications">[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [selectedWorkspace])

  const fetchApplications = async () => {
    if (selectedWorkspace) {
      setIsLoading(true)
      try {
        const apps = await getApplicationsByWorkspaceId(selectedWorkspace.id)
        setApplications(apps)
      } catch (error) {
        console.error("Failed to fetch applications:", error)
        toast.error("Failed to fetch applications")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCreateApplication = () => {
    router.push("/applications/create")
  }

  const handleDeleteApplication = async (
    e: React.MouseEvent,
    appId: string
  ) => {
    e.stopPropagation() // Prevent navigation when clicking delete
    try {
      await deleteApplication(appId)
      setApplications(prev => prev.filter(app => app.id !== appId))
      toast.success("Application deleted successfully")
    } catch (error) {
      console.error("Failed to delete application:", error)
      toast.error("Failed to delete application")
    }
  }

  const handleViewApplication = (appId: string) => {
    router.push(`/applications/${appId}`)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Applications</h2>
        <Button onClick={handleCreateApplication}>
          <IconPlus size={20} stroke={1.5} className="mr-2" /> Create
          Application
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {applications.map(app => (
          <Card
            key={app.id}
            className="group relative flex cursor-pointer flex-col rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            onClick={() => handleViewApplication(app.id)}
          >
            <CardHeader>
              <CardTitle>{app.name}</CardTitle>
            </CardHeader>
            <CardContent className="grow">
              <p className="mb-2 text-sm text-gray-600">{app.description}</p>
              <p className="text-xs text-gray-500">Sharing: {app.sharing}</p>
              <p className="text-xs text-gray-500">
                Theme: {app.theme || "Default"}
              </p>
              <p className="text-xs text-gray-500">
                Created: {new Date(app.created_at).toLocaleDateString()}
              </p>
            </CardContent>
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 size-6 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={e => handleDeleteApplication(e, app.id)}
            >
              <Trash2 className="size-3" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
