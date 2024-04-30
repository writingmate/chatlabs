import { ContentType } from "@/types"
import {
  IconAdjustmentsHorizontal,
  IconBolt,
  IconBooks,
  IconDiamond,
  IconDiamondFilled,
  IconFile,
  IconMessage,
  IconPencil,
  IconPuzzle,
  IconRobotFace,
  IconSearch,
  IconSparkles,
  IconTerminal2
} from "@tabler/icons-react"
import { FC, useContext } from "react"
import { TabsList } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { ProfileSettings } from "../utility/profile-settings"
import { SidebarSwitchItem } from "./sidebar-switch-item"
import { ChatbotUIContext } from "@/context/context"
import { validateProPlan } from "@/lib/subscription"
import { Input } from "@/components/ui/input"

export const SIDEBAR_ICON_SIZE = 20

interface SidebarSwitcherProps {
  onSearchChange: (search: string) => void
  onContentTypeChange: (contentType: ContentType) => void
}

type SidebarContentItemProps = {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

function SidebarContentItem({ icon, label, onClick }: SidebarContentItemProps) {
  return (
    <div
      onClick={onClick}
      className={
        "hover:bg-accent focus:bg-accent group flex w-full cursor-pointer items-center rounded px-2 py-1.5 hover:opacity-50 focus:outline-none"
      }
    >
      {icon}
      <div className={"ml-3 flex-1 truncate text-sm"}>{label}</div>
    </div>
  )
}

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onSearchChange,
  onContentTypeChange
}) => {
  return (
    <div className="flex flex-col text-sm">
      <SidebarContentItem
        icon={<IconRobotFace size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
        label={"Assistants"}
        onClick={() => onContentTypeChange("assistants")}
      />
      <SidebarContentItem
        icon={<IconTerminal2 size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
        label={"Prompts"}
        onClick={() => onContentTypeChange("prompts")}
      />
      <SidebarContentItem
        icon={<IconFile size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
        label={"Files"}
        onClick={() => onContentTypeChange("files")}
      />
    </div>
  )
}
