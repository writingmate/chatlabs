"use client"
import { useContext } from "react"
import { ChatbotUIContext } from "@/context/context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { SidebarCreateButtons } from "@/components/sidebar2/sidebar-create-buttons"
import { SidebarDataList } from "@/components/sidebar2/sidebar-data-list"
import { useRouter } from "next/navigation"
import PageContent from "@/components/page/page-content"
import PageHeader from "@/components/page/page-header"
import PageTitle from "@/components/page/page-title"
import { Dashboard } from "@/components/ui/dashboard"
import { AssistantItem } from "@/components/sidebar2/items/assistants/assistant-item"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { ModelIcon } from "@/components/models/model-icon"
import { AssistantIcon } from "@/components/assistants/assistant-icon"

export default function AssistantsPage() {
  let { assistants: data } = useContext(ChatbotUIContext)

  return (
    <Dashboard>
      <PageContent className={"h-full justify-start"}>
        <PageHeader
          className={
            "flex w-full flex-row items-center justify-between space-y-0"
          }
        >
          <PageTitle className={"capitalize"}>Assistants</PageTitle>
          <SidebarCreateButtons
            contentType={"assistants"}
            hasData={data.length > 0}
          />
        </PageHeader>
        <div className="grid w-full grid-cols-2 items-start justify-between gap-2">
          {data.map(assistant => (
            <Card
              className={
                "hover:bg-foreground/5 cursor-pointer rounded-xl border-none"
              }
              key={assistant.id}
            >
              <CardContent className={"flex space-x-3 p-4"}>
                <AssistantIcon
                  className={
                    "shrink-0 justify-center overflow-hidden rounded-xl p-4"
                  }
                  assistant={assistant}
                  size={50}
                />
                <div className={"flex flex-col"}>
                  <CardTitle className={"text-lg"}>{assistant.name}</CardTitle>
                  <CardDescription className={"line-clamp-3 text-xs"}>
                    {assistant.description}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          ))}
          {data.length === 0 && (
            <div className="flex h-full items-center justify-center bg-black/50 text-2xl text-white">
              No assistants found <br /> Create a new assistant to get started{" "}
            </div>
          )}
        </div>
      </PageContent>
    </Dashboard>
  )
}
