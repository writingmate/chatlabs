import { Tables } from "@/supabase/types"
import { ContentType, DataListType } from "@/types"
import { FC, useContext, useState } from "react"
import { SidebarDataList } from "./sidebar-data-list"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { SidebarCreateButtons } from "@/components/sidebar2/sidebar-create-buttons"
import { ChatbotUIContext } from "@/context/context"
import { Input } from "@/components/ui/input"

interface SidebarContentProps {
  contentType: ContentType
  data: DataListType
  folders: Tables<"folders">[]
  name?: string
  children: JSX.Element
}

export const SidebarDialog: FC<SidebarContentProps> = ({
  contentType,
  data,
  folders,
  name,
  children
}) => {
  const [searchTerm, setSearchTerm] = useState("")

  const { isSidebarDialogOpen, setIsSidebarDialogOpen } =
    useContext(ChatbotUIContext)

  const filteredData: any = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  name = name || contentType

  return (
    // Subtract 50px for the height of the workspace settings
    <Dialog open={isSidebarDialogOpen} onOpenChange={setIsSidebarDialogOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className={"min-h-[200px] min-w-[400px]"}>
        <DialogHeader
          className={
            "flex w-full flex-row items-center justify-between space-x-2 space-y-0"
          }
        >
          <DialogTitle className={"capitalize"}>{name}</DialogTitle>
          <div className={"flex justify-end space-x-2"}>
            <Input
              className={"h-[32px]"}
              placeholder={"Search"}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <SidebarCreateButtons
              name={name}
              contentType={contentType}
              hasData={data.length > 0}
            />
          </div>
        </DialogHeader>
        <SidebarDataList
          contentType={contentType}
          data={filteredData}
          folders={folders}
        />
      </DialogContent>
    </Dialog>
  )
}
