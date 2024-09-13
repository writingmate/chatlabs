"use client"

import { FC, useState, useEffect, useContext } from "react"
import { CreateApplication } from "./create-application"
import { Application } from "@/types"
import { Button } from "../ui/button"
import { ChatbotUIContext } from "@/context/context"
import {
  getApplicationsByWorkspaceId,
  getApplicationTools
} from "@/db/applications"
import { Loader } from "@/components/ui/loader"
import { Tables } from "@/supabase/types"

export const ApplicationView: FC = () => {
  const { selectedWorkspace, tools, models } = useContext(ChatbotUIContext)
  const [applications, setApplications] = useState<Tables<"applications">[]>([])
  const [selectedApp, setSelectedApp] = useState<Tables<"applications"> | null>(
    null
  )
  const [selectedAppTools, setSelectedAppTools] = useState<Tables<"tools">[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      if (selectedWorkspace) {
        setIsLoading(true)
        try {
          const apps = await getApplicationsByWorkspaceId(selectedWorkspace.id)
          setApplications(apps)
        } catch (error) {
          console.error("Failed to fetch applications:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchApplications()
  }, [selectedWorkspace])

  const handleCreateApplication = (newApplication: Tables<"applications">) => {
    setApplications(prev => [...prev, newApplication])
  }

  const handleSelectApp = async (app: Tables<"applications">) => {
    setSelectedApp(app)
    try {
      const appTools = await getApplicationTools(app.id)
      // setSelectedAppTools(appTools)
    } catch (error) {
      console.error("Failed to fetch application tools:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="w-full p-4 md:w-1/2 md:border-r">
        <h2 className="mb-4 text-xl font-semibold">Create New Application</h2>
        <CreateApplication onApplicationCreated={handleCreateApplication} />
        <h2 className="mb-2 mt-8 text-xl font-semibold">
          Existing Applications
        </h2>
        <div className="space-y-2">
          {applications.map(app => (
            <Button
              key={app.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSelectApp(app)}
            >
              {app.name}
            </Button>
          ))}
        </div>
      </div>
      <div className="w-full p-4 md:w-1/2">
        {selectedApp ? (
          <div>
            <h2 className="mb-4 text-xl font-semibold">{selectedApp.name}</h2>
            <p className="mb-4 text-sm text-gray-600">
              {selectedApp.description}
            </p>
            <p className="text-sm">
              Created: {new Date(selectedApp.created_at).toLocaleString()}
            </p>
            {selectedApp.updated_at && (
              <p className="text-sm">
                Updated: {new Date(selectedApp.updated_at).toLocaleString()}
              </p>
            )}
            <p className="text-sm">Sharing: {selectedApp.sharing}</p>
            {/*<p className="text-sm">Model: {models.find(m => m.id === selectedApp.model)?.name || 'Not set'}</p>*/}
            <h3 className="mt-4 text-lg font-semibold">Tools:</h3>
            <ul className="list-disc pl-5">
              {selectedAppTools.map(tool => (
                <li key={tool.id}>{tool.name}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-lg text-gray-500">
              Select an application to view details
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
