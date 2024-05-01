import { Tables } from "@/supabase/types"
import { ContentType, DataListType } from "@/types"
import { FC, useState } from "react"
import { SidebarDataList } from "./sidebar-data-list"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { SidebarCreateButtons } from "@/components/sidebar2/sidebar-create-buttons"

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

  const [isOpen, setIsOpen] = useState(false)

  const filteredData: any = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  name = name || contentType

  return (
    // Subtract 50px for the height of the workspace settings
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className={"min-h-[200px] min-w-[400px]"}>
        <DialogHeader
          className={
            "flex w-full flex-row items-center justify-between space-y-0"
          }
        >
          <DialogTitle className={"capitalize"}>{name}</DialogTitle>
          <SidebarCreateButtons
            name={name}
            contentType={contentType}
            hasData={data.length > 0}
          />
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
