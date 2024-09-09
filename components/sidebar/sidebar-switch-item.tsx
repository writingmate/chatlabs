import { ContentType } from "@/types"
import { FC } from "react"
import { TabsTrigger } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"

interface SidebarSwitchItemProps {
  contentType: ContentType
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
  name?: string
}

export const SidebarSwitchItem: FC<SidebarSwitchItemProps> = ({
  contentType,
  icon,
  isActive,
  onClick,
  name
}) => {
  const resolvedName = name || contentType
  return (
    <WithTooltip
      display={
        <div>{resolvedName[0].toUpperCase() + resolvedName.substring(1)}</div>
      }
      trigger={
        <TabsTrigger
          className={`hover:opacity-50 ${isActive ? "bg-accent" : ""}`}
          value={contentType}
          onClick={onClick}
        >
          {icon}
        </TabsTrigger>
      }
    />
  )
}
