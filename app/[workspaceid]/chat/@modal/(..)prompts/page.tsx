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
import { IconLayoutDashboard } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

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
          <div className={"flex items-center space-x-1"}>
            <SidebarCreateButtons
              contentType={"prompts"}
              hasData={data.length > 0}
            />
          </div>
        </DialogHeader>
        <SidebarDataList
          RowComponent={PromptItem}
          contentType={"prompts"}
          data={data}
          folders={filteredFolders}
        />
        <Button
          size={"xs"}
          variant={"outline"}
          className={"flex items-center space-x-1"}
          onClick={e => {
            e.preventDefault()
            router.push("/prompts")
          }}
        >
          <IconLayoutDashboard stroke={1.5} size={18} />
          <div>View community prompts</div>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
