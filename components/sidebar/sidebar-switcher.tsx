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
  IconBulb
} from "@tabler/icons-react"
import { FC, useContext } from "react"
import { TabsList, TabsTrigger } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { ProfileSettings } from "../utility/profile-settings"
import { SidebarSwitchItem } from "./sidebar-switch-item"
import { ChatbotUIContext } from "@/context/context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { PLAN_FREE } from "@/lib/stripe/config"

export const SIDEBAR_ICON_SIZE = 28
export const SIDEBAR_ICON_STROKE = 1.5

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
    <div className="flex flex-col justify-between border-r pb-5">
      <TabsList className="bg-background grid h-[400px] grid-rows-7">
        <SidebarSwitchItem
          icon={<IconMessage size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
          contentType="chats"
          onContentTypeChange={onContentTypeChange}
        />

        {/*<SidebarSwitchItem*/}
        {/*  icon={<IconAdjustmentsHorizontal size={SIDEBAR_ICON_SIZE} />}*/}
        {/*  contentType="presets"*/}
        {/*  onContentTypeChange={onContentTypeChange}*/}
        {/*/>*/}

        <SidebarSwitchItem
          icon={<IconBulb size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
          contentType="prompts"
          onContentTypeChange={onContentTypeChange}
        />

        {/*<SidebarSwitchItem*/}
        {/*  icon={<IconSparkles size={SIDEBAR_ICON_SIZE} />}*/}
        {/*  contentType="models"*/}
        {/*  onContentTypeChange={onContentTypeChange}*/}
        {/*/>*/}

        <SidebarSwitchItem
          icon={<IconFile size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
          contentType="files"
          onContentTypeChange={onContentTypeChange}
        />

        {/*<SidebarSwitchItem*/}
        {/*  icon={<IconBooks size={SIDEBAR_ICON_SIZE} />}*/}
        {/*  contentType="collections"*/}
        {/*  onContentTypeChange={onContentTypeChange}*/}
        {/*/>*/}

        <SidebarSwitchItem
          icon={<IconRobotFace size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
          contentType="assistants"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconPuzzle size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
          contentType="tools"
          name="Plugins"
          onContentTypeChange={onContentTypeChange}
        />

        <WithTooltip
          display={"Split Screen"}
          asChild
          trigger={
            <Button
              className="mx-auto hover:opacity-50"
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
      </TabsList>

      <div className="flex flex-col items-center space-y-4">
        {/* TODO */}
        {/* <WithTooltip display={<div>Import</div>} trigger={<Import />} /> */}

        {/* TODO */}
        {/* <Alerts /> */}
        {profile?.plan === PLAN_FREE && (
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
          trigger={<ProfileSettings isCollapsed={false} />}
        />
      </div>
    </div>
  )
}
