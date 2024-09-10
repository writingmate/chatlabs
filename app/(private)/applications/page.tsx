import { FC } from "react"
import { ApplicationView } from "@/components/applications/application-view"

const ApplicationsPage: FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Applications</h1>
      <ApplicationView />
    </div>
  )
}

export default ApplicationsPage
