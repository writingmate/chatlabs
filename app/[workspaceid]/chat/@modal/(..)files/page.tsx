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

export default function FilesPage() {
  const { files: data, folders } = useContext(ChatbotUIContext)

  const filteredFolders = folders.filter(folder => folder.type === "files")

  const router = useRouter()

  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogContent className={"min-h-[200px] min-w-[400px]"}>
        <DialogHeader
          className={
            "flex w-full flex-row items-center justify-between space-y-0"
          }
        >
          <DialogTitle className={"capitalize"}>Files</DialogTitle>
          <SidebarCreateButtons
            contentType={"files"}
            hasData={data.length > 0}
          />
        </DialogHeader>
        <SidebarDataList
          contentType={"files"}
          data={data}
          folders={filteredFolders}
        />
      </DialogContent>
    </Dialog>
  )
}
