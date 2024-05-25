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
import { FileItem } from "@/components/sidebar2/items/files/file-item"

export default function FilesPage() {
  const { files: data, folders } = useContext(ChatbotUIContext)

  const filteredFolders = folders.filter(folder => folder.type === "files")

  return (
    <Dashboard>
      <PageContent>
        <PageHeader
          className={
            "flex w-full flex-row items-center justify-between space-y-0"
          }
        >
          <PageTitle className={"capitalize"}>Files</PageTitle>
          <SidebarCreateButtons
            contentType={"files"}
            hasData={data.length > 0}
          />
        </PageHeader>
        <SidebarDataList
          RowComponent={FileItem}
          contentType={"files"}
          data={data}
          folders={filteredFolders}
        />
      </PageContent>
    </Dashboard>
  )
}
