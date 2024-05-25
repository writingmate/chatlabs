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
import { PromptItem } from "@/components/sidebar2/items/prompts/prompt-item"

export default function PromptsPage() {
  const { prompts: data, folders } = useContext(ChatbotUIContext)

  const filteredFolders = folders.filter(folder => folder.type === "prompts")

  const router = useRouter()

  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogContent className={"min-h-[200px] min-w-[400px]"}>
        <DialogHeader
          className={
            "flex w-full flex-row items-center justify-between space-y-0"
          }
        >
          <DialogTitle className={"capitalize"}>Prompts</DialogTitle>
          <SidebarCreateButtons
            contentType={"prompts"}
            hasData={data.length > 0}
          />
        </DialogHeader>
        <SidebarDataList
          RowComponent={PromptItem}
          contentType={"prompts"}
          data={data}
          folders={filteredFolders}
        />
      </DialogContent>
    </Dialog>
  )
}
