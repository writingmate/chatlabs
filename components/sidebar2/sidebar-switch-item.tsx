import { ContentType } from "@/types"
import { FC } from "react"
import { TabsTrigger } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { cn } from "@/lib/utils"
import { SidebarDialog } from "@/components/sidebar2/sidebar-dialog"

type SidebarSwitchItemProps = {
  icon: React.ReactNode
  contentType: ContentType
  folders?: any
  label: string
  data: any
  onClick: () => void
  // active: boolean
}

export function SidebarSwitchItem({
  icon,
  contentType,
  label,
  onClick,
  data,
  folders
}: SidebarSwitchItemProps) {
  return (
    <SidebarDialog
      folders={folders}
      name={label}
      data={data}
      contentType={contentType}
    >
      <div
        onClick={onClick}
        className={
          "hover:bg-accent/60 flex-start focus:bg-accent group flex h-[32px] w-full cursor-pointer items-center rounded px-2 focus:outline-none"
        }
      >
        {icon}
        <div className={"ml-3 flex-1 truncate text-left text-sm"}>{label}</div>
      </div>
    </SidebarDialog>
  )
}
