"use client"
import { useContext, useRef } from "react"
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
import { FileItem } from "@/components/sidebar2/items/files/file-item"
import { Input } from "@/components/ui/input"
import { useSelectFileHandler } from "@/components/chat/chat-hooks/use-select-file-handler"
import { Button } from "@/components/ui/button"
import { IconFileUpload } from "@tabler/icons-react"

export default function FilesPage() {
  const { files: data, folders } = useContext(ChatbotUIContext)

  const { filesToAccept, handleSelectDeviceFile, isUploading } =
    useSelectFileHandler()

  const fileInputRef = useRef<HTMLInputElement>(null)

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
          <Button
            size={"xs"}
            variant={"outline"}
            className={"flex items-center space-x-1"}
            onClick={e => {
              e.preventDefault()
              fileInputRef.current?.click()
            }}
          >
            <IconFileUpload stroke={1.5} size={18} />
            <div>Upload file</div>
          </Button>
          <Input
            ref={fileInputRef}
            className="hidden"
            type="file"
            onChange={e => {
              if (!e.target.files) return
              handleSelectDeviceFile(e.target.files[0])
              router.back()
            }}
            accept={filesToAccept}
          />
        </DialogHeader>
        <SidebarDataList
          RowComponent={FileItem}
          contentType={"files"}
          data={data}
          folders={filteredFolders}
        />
      </DialogContent>
    </Dialog>
  )
}
