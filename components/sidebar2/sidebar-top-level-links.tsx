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
import { FC, useContext, useEffect } from "react"
import { TabsList } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { ProfileSettings } from "../utility/profile-settings"
import { ChatbotUIContext } from "@/context/context"
import { validateProPlan } from "@/lib/subscription"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { SidebarTopLevelLink } from "@/components/sidebar2/sidebar-top-level-link"
import { useRouter } from "next/navigation"

export const SIDEBAR_ICON_SIZE = 20

interface SidebarTopLevelLinksProps {
  className?: string
  contentType: ContentType
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarTopLevelLinks: FC<SidebarTopLevelLinksProps> = ({
  className,
  contentType,
  onContentTypeChange
}) => {
  const { selectedWorkspace, files, prompts, assistants, folders } =
    useContext(ChatbotUIContext)

  const menuItems = [
    {
      icon: <IconRobotFace size={SIDEBAR_ICON_SIZE} stroke={1.5} />,
      label: "Assistants",
      contentType: "assistants",
      data: assistants,
      folders: folders.filter(folder => folder.type === "assistants")
    },
    {
      icon: <IconTerminal2 size={SIDEBAR_ICON_SIZE} stroke={1.5} />,
      label: "Prompts",
      contentType: "prompts",
      data: prompts,
      folders: folders.filter(folder => folder.type === "prompts")
    },
    {
      icon: <IconFile size={SIDEBAR_ICON_SIZE} stroke={1.5} />,
      label: "Files",
      contentType: "files",
      data: files,
      folders: folders.filter(folder => folder.type === "files")
    }
  ]

  const router = useRouter()

  useEffect(() => {
    menuItems.map(x => router.prefetch(`./${x.contentType}`))
  }, [])

  return (
    <div
      className={cn("z-10 mb-2 flex flex-col border-b pb-2 text-sm", className)}
    >
      {menuItems.map((item, index) => (
        <SidebarTopLevelLink
          href={`/${selectedWorkspace?.id}/chat/${item.contentType}`}
          folders={item.folders}
          key={index}
          // active={contentType === item.contentType}
          icon={item.icon}
          label={item.label}
        />
      ))}
    </div>
  )
}
