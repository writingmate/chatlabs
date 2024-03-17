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
  IconRobotFace,
  IconSparkles
} from "@tabler/icons-react"
import { FC, useContext } from "react"
import { TabsList } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { ProfileSettings } from "../utility/profile-settings"
import { SidebarSwitchItem } from "./sidebar-switch-item"
import { ChatbotUIContext } from "@/context/context"

export const SIDEBAR_ICON_SIZE = 28

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange
}) => {
  const { profile, setIsPaywallOpen } = useContext(ChatbotUIContext)

  return (
    <div className="flex flex-col justify-between border-r pb-5">
      <TabsList className="bg-background grid h-[440px] grid-rows-7">
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
          icon={<IconPencil size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
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
          icon={<IconBolt size={SIDEBAR_ICON_SIZE} stroke={1.5} />}
          contentType="tools"
          name="Plugins"
          onContentTypeChange={onContentTypeChange}
        />
      </TabsList>

      <div className="flex flex-col items-center space-y-4">
        {/* TODO */}
        {/* <WithTooltip display={<div>Import</div>} trigger={<Import />} /> */}

        {/* TODO */}
        {/* <Alerts /> */}
        {profile?.plan == "free" && (
          <WithTooltip
            display={
              <div>Upgrade to paid plans to get access to all features.</div>
            }
            trigger={
              <IconDiamondFilled
                onClick={() => setIsPaywallOpen(true)}
                className="cursor-pointer pt-[4px] text-violet-700 hover:opacity-50"
                size={28}
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
