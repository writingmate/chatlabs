import React, { FC, useRef } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  IconCode,
  IconPlayerPlay,
  IconWorld,
  IconX,
  IconDownload,
  IconEye
} from "@tabler/icons-react"

import { CopyButton } from "@/components/ui/copy-button"
import Loading from "@/components/ui/loading"
import {
  ThemeConfigurator,
  UITheme
} from "@/components/code-viewer/theme-configurator"
import NavbarButton from "@/components/code-viewer/code-navbar-button"

interface NavbarProps {
  language: string
  isGenerating?: boolean
  execute: boolean
  setExecute: (execute: boolean) => void
  setSharing: (sharing: boolean) => void
  onClose?: () => void
  onThemeChange: (theme: UITheme) => void
  showCloseButton: boolean
  downloadAsFile: () => void
  showShareButton?: any
  copyValue: string // Add prop for the value to be copied
}

export const CodeViewerNavbar: FC<NavbarProps> = ({
  language,
  isGenerating,
  execute,
  setExecute,
  setSharing,
  onClose,
  showCloseButton,
  downloadAsFile,
  onThemeChange,
  copyValue, // Use the new prop
  showShareButton = true
}) => {
  const downloadButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="border-accent/60 bg-accent text-foreground z-10 flex w-full items-center justify-between border-b px-4">
      <div className="flex items-center space-x-2">
        <span className="text-xs lowercase">{language}</span>
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
              onValueChange={value => setExecute(value === "execute")}
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
                className="bg-transparent px-2 text-xs"
              />
            )}
            <ThemeConfigurator
              disabled={isGenerating}
              onThemeChange={onThemeChange}
            />
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
