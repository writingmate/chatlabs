import { ContentType } from "@/types"
import {
  IconAdjustmentsHorizontal,
  IconBolt,
  IconBooks,
  IconDiamond,
  IconDiamondFilled,
  IconFile,
  IconLayoutBoardSplit,
  IconLayoutColumns,
  IconMessage,
  IconPencil,
  IconPuzzle,
  IconRobotFace,
  IconSparkles,
  IconTerminal2
} from "@tabler/icons-react"
import { FC, useContext } from "react"
import { TabsList, TabsTrigger } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { ProfileSettings } from "../utility/profile-settings"
import { SidebarSwitchItem } from "./sidebar-switch-item"
import { ChatbotUIContext } from "@/context/context"
import { validateProPlan } from "@/lib/subscription"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export const SIDEBAR_ICON_SIZE = 28

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange
}) => {
  const { profile, selectedWorkspace, setIsPaywallOpen } =
    useContext(ChatbotUIContext)

  const router = useRouter()
  return (
    <div className="flex h-full flex-col justify-between border-r">
      <TabsList className="bg-background flex h-full flex-col items-center justify-center space-y-6">
        <div className="flex flex-col items-center">
          <SidebarSwitchItem
            icon={<IconMessage size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
            contentType="chats"
            onContentTypeChange={onContentTypeChange}
          />
          <span className="mt-1 text-xs">Chat</span>
        </div>

        <div className="flex flex-col items-center">
          <SidebarSwitchItem
            icon={<IconTerminal2 size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
            contentType="prompts"
            onContentTypeChange={onContentTypeChange}
          />
          <span className="mt-1 text-xs">Prompt</span>
        </div>

        <div className="flex flex-col items-center">
          <SidebarSwitchItem
            icon={<IconFile size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
            contentType="files"
            onContentTypeChange={onContentTypeChange}
          />
          <span className="mt-1 text-xs">File</span>
        </div>

        <div className="flex flex-col items-center">
          <SidebarSwitchItem
            icon={<IconRobotFace size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
            contentType="assistants"
            onContentTypeChange={onContentTypeChange}
          />
          <span className="mt-1 text-xs">Assistant</span>
        </div>

        <div className="flex flex-col items-center">
          <SidebarSwitchItem
            icon={<IconPuzzle size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
            contentType="tools"
            name="Plugins"
            onContentTypeChange={onContentTypeChange}
          />
          <span className="mt-1 text-xs">Plugin</span>
        </div>

        <div className="flex flex-col items-center">
          <WithTooltip
            display={"Split Screen"}
            asChild
            trigger={
              <Button
                className="hover:opacity-50"
                variant="ghost"
                size="icon"
                onClick={e => {
                  window.open(`/splitview`, "_blank")
                }}
              >
                <IconLayoutColumns size={SIDEBAR_ICON_SIZE} stroke={1.5} />
              </Button>
            }
          />
          <span className="mt-1 text-xs">Split Screen</span>
        </div>
      </TabsList>

      <div className="flex flex-col items-center space-y-4">
        {/* TODO */}
        {/* <WithTooltip display={<div>Import</div>} trigger={<Import />} /> */}

        {/* TODO */}
        {/* <Alerts /> */}
        {!validateProPlan(profile) && (
          <WithTooltip
            display={
              <div>Upgrade to paid plans to get access to all features.</div>
            }
            trigger={
              <IconDiamondFilled
                onClick={() => setIsPaywallOpen(true)}
                className="cursor-pointer pt-[4px] text-violet-700 hover:opacity-50"
                stroke={1.5}
                size={SIDEBAR_ICON_SIZE}
              />
            }
          />
        )}

        <WithTooltip
          display={<div>Profile Settings</div>}
          trigger={<ProfileSettings />}
        />
      </div>
    </div>
  )
}
