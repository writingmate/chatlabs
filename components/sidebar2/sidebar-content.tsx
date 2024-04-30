import { Tables } from "@/supabase/types"
import { ContentType, DataListType } from "@/types"
import { FC, useState } from "react"
import { SidebarCreateButtons } from "./sidebar-create-buttons"
import { SidebarDataList } from "./sidebar-data-list"
import { SidebarSwitcher } from "@/components/sidebar2/sidebar-switcher"
import { IconSearch } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { SidebarSearch } from "@/components/sidebar2/sidebar-search"

interface SidebarContentProps {
  contentType: ContentType
  data: DataListType
  folders: Tables<"folders">[]
  name?: string
}

export const SidebarContent: FC<SidebarContentProps> = ({
  contentType,
  data,
  folders,
  name
}) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData: any = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    // Subtract 50px for the height of the workspace settings
    <div className="flex max-h-full grow flex-col overflow-auto">
      <div className="mt-1 flex items-center">
        <SidebarCreateButtons
          name={name}
          contentType={contentType}
          hasData={data.length > 0}
        />
      </div>
      <SidebarSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      {!searchTerm && (
        <SidebarSwitcher
          onSearchChange={setSearchTerm}
          onContentTypeChange={() => {}}
        />
      )}

      {/*<div className="mt-2">*/}
      {/*  <SidebarSearch*/}
      {/*    contentType={contentType}*/}
      {/*    searchTerm={searchTerm}*/}
      {/*    setSearchTerm={setSearchTerm}*/}
      {/*  />*/}
      {/*</div>*/}

      <SidebarDataList
        contentType={contentType}
        data={filteredData}
        folders={folders}
      />
    </div>
  )
}
