import React, { FC, useRef } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  IconCode,
  IconWorld,
  IconX,
  IconDownload,
  IconEye,
  IconArrowFork,
  IconLayoutSidebar,
  IconLockAccess,
  IconLock
} from "@tabler/icons-react"

import { CopyButton } from "@/components/ui/copy-button"
import Loading from "@/components/ui/loading"
import { UITheme } from "@/components/code-viewer/theme-configurator"
import NavbarButton from "@/components/code-viewer/code-navbar-button"
import { Tables } from "@/supabase/types"
import { Badge } from "../ui/badge"
import { WithTooltip } from "../ui/with-tooltip"

interface NavbarProps {
  showSidebarButton: boolean
  language: string
  isGenerating?: boolean
  isEditable: boolean
  execute: boolean
  setExecute: (execute: boolean) => void
  setSharing: (sharing: boolean) => void
  onClose?: () => void
  toggleSidebar: () => void
  onThemeChange: (theme: UITheme) => void
  showCloseButton: boolean
  downloadAsFile: () => void
  onFork: () => void
  showForkButton?: boolean
  filename: string
  showShareButton?: any
  copyValue: string // Add prop for the value to be copied
}

export const CodeViewerNavbar: FC<NavbarProps> = ({
  language,
  isGenerating,
  isEditable,
  execute,
  setExecute,
  setSharing,
  onClose,
  toggleSidebar,
  showForkButton,
  showSidebarButton,
  showCloseButton,
  downloadAsFile,
  filename,
  onThemeChange,
  copyValue, // Use the new prop
  showShareButton = true,
  onFork
}) => {
  const downloadButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="bg-accent text-foreground z-5 flex w-full items-center justify-between border-b px-4">
      <div className="flex items-center space-x-2">
        {!isEditable && (
          <WithTooltip
            display={"This code is not editable"}
            trigger={
              <IconLock
                size={16}
                className="text-muted-foreground"
                stroke={1.5}
              />
            }
          />
        )}
        <span className="text-xs lowercase">{filename}</span>
        {isGenerating && (
          <div className={"size-4"}>
            <Loading />
          </div>
        )}
      </div>
      <div className="flex items-center space-x-3 py-3">
        {["html"].includes(language.toLowerCase()) && (
          <>
            <ToggleGroup
              disabled={isGenerating}
              onValueChange={value => {
                if (!value) return
                setExecute(value === "execute")
              }}
              size={"xs"}
              variant={"default"}
              className={"gap-0 overflow-hidden rounded-md"}
              type={"single"}
              value={execute ? "execute" : "code"}
            >
              <ToggleGroupItem
                title={"View the code"}
                value={"code"}
                className={`text-muted-foreground data-[state=on]:text-foreground space-x-1 rounded-r-none border border-r-0 text-xs font-medium`}
              >
                <IconCode size={16} stroke={1.5} />
                <span>Code</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                title={"Preview the code"}
                value={"execute"}
                className={`text-muted-foreground data-[state=on]:text-foreground space-x-1 rounded-l-none border text-xs font-medium`}
              >
                <IconEye size={16} stroke={1.5} />
                <span>Preview</span>
              </ToggleGroupItem>
            </ToggleGroup>
            {showShareButton && (
              <NavbarButton
                icon={<IconWorld className={"mr-1"} size={16} />}
                title="Share your app with others"
                onClick={() => setSharing(true)}
                disabled={isGenerating}
              />
            )}
            {/*<ThemeConfigurator*/}
            {/*  disabled={isGenerating}*/}
            {/*  onThemeChange={onThemeChange}*/}
            {/*/>*/}
            {showForkButton && (
              <NavbarButton
                icon={<IconArrowFork size={16} />}
                title="Fork"
                onClick={onFork}
                disabled={isGenerating}
              />
            )}
            {showSidebarButton && (
              <NavbarButton
                icon={<IconLayoutSidebar size={16} />}
                title="Sidebar"
                onClick={toggleSidebar}
                disabled={isGenerating}
              />
            )}
          </>
        )}
        <NavbarButton
          ref={downloadButtonRef}
          icon={<IconDownload size={16} />}
          title="Download as file"
          onClick={downloadAsFile}
          disabled={isGenerating}
        />
        <CopyButton value={copyValue} className={"text-foreground"} />{" "}
        {/* Add CopyButton here */}
        {showCloseButton && (
          <NavbarButton
            icon={<IconX size={16} />}
            title="Close"
            onClick={onClose}
          />
        )}
      </div>
    </div>
  )
}
