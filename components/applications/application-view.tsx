"use client"

import { FC, useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import { ChatbotUIContext } from "@/context/context"
import { Application } from "@/types"
import { Button } from "../ui/button"
import {
  getApplicationsByWorkspaceId,
  deleteApplication
} from "@/db/applications"
import { Loader } from "@/components/ui/loader"
import { Tables } from "@/supabase/types"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

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

  const handleDeleteApplication = async (appId: string) => {
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
    <div className="flex h-full flex-col">
      <div className="w-full p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Applications</h2>
          <Button onClick={handleCreateApplication}>
            Create New Application
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Sharing</TableHead>
              <TableHead>Theme</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map(app => (
              <TableRow key={app.id}>
                <TableCell>{app.name}</TableCell>
                <TableCell>{app.description}</TableCell>
                <TableCell>{app.sharing}</TableCell>
                <TableCell>{app.theme || "Default"}</TableCell>
                <TableCell>
                  {new Date(app.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => handleViewApplication(app.id)}
                  >
                    View
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteApplication(app.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
