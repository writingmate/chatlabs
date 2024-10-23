import { FC, useContext, useEffect, useState } from "react"
import { ChatbotUIChatContext } from "@/context/chat"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { IconCircleCheckFilled } from "@tabler/icons-react"
import { Schema } from "zod"

import { MultiSelect } from "@/components/ui/multi-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import {
  ThemeConfigurator,
  UITheme
} from "@/components/code-viewer/theme-configurator"

import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"

type CodeViewerSidebarProps = {
  isOpen: boolean
  theme: { name: string; theme: UITheme }
  setTheme: (theme: { name: string; theme: UITheme }) => void
  setIsOpen: (open: boolean) => void
}

const CodeViewerSidebar: FC<CodeViewerSidebarProps> = ({
  isOpen,
  theme,
  setTheme,
  setIsOpen
}) => {
  const { tools: plugins, allModels } = useContext(ChatbotUIContext)
  const { chatSettings, setChatSettings, setSelectedTools } =
    useContext(ChatbotUIChatContext)

  const [selectedLLM, setSelectedLLM] = useState<string>(
    allModels[0]?.modelId ?? ""
  )
  const [selectedPlugins, setSelectedPlugins] = useState<Tables<"tools">[]>([])

  // useEffect(() => {
  //   updateSystemPromptWithTools()
  // }, [selectedPlugins])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col justify-between" side="right">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="flex grow flex-col justify-between overflow-auto px-1">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <ThemeConfigurator theme={theme} onThemeChange={setTheme} />
            </div>
            {/* <Separator /> */}
            <div className="space-y-1">
              <Label>Plugins</Label>
              <div className="text-foreground/60 text-xs">
                Select the plugins that app can use
              </div>
              <MultiSelect
                options={plugins.map(plugin => ({
                  value: plugin.id,
                  label: plugin.name
                }))}
                selectedOptions={selectedPlugins.map(plugin => ({
                  value: plugin.id,
                  label: plugin.name
                }))}
                onChange={selected => {
                  setSelectedPlugins(
                    selected.map(
                      s =>
                        plugins.find(
                          plugin => plugin.id === s.value
                        ) as Tables<"tools">
                    ) as Tables<"tools">[]
                  )
                }}
                renderOption={(
                  plugin: { value: string; label: string },
                  selected: boolean,
                  onSelect: () => void
                ) => (
                  <PluginItem
                    key={plugin.value}
                    plugin={
                      plugins.find(
                        p => p.id === plugin.value
                      ) as Tables<"tools">
                    }
                    selected={selected}
                    onSelect={onSelect}
                  />
                )}
                placeholder="Select plugins"
                searchPlaceholder="Search plugins..."
              />
            </div>
            <div className="space-y-1">
              <Label>Model</Label>
              <div className="text-foreground/60 text-xs">
                Select the model that app can talk to
              </div>
              <Select value={selectedLLM} onValueChange={setSelectedLLM}>
                <SelectTrigger>
                  <SelectValue>
                    {
                      allModels.find(model => model.modelId === selectedLLM)
                        ?.modelName
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {allModels.map(llm => (
                    <SelectItem key={llm.modelId} value={llm.modelId}>
                      {llm.modelName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            size={"sm"}
            onClick={() => setIsOpen(false)}
            className="w-full"
          >
            Apply
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface PluginItemProps {
  plugin: Tables<"tools">
  selected: boolean
  onSelect: () => void
}

const PluginItem: FC<PluginItemProps> = ({ plugin, selected, onSelect }) => {
  return (
    <div
      className="flex cursor-pointer items-center justify-between py-0.5 pl-2 text-sm hover:opacity-50"
      onClick={onSelect}
    >
      <div className="flex grow items-center truncate">
        <div className="truncate">{plugin.name}</div>
      </div>
      {selected && (
        <IconCircleCheckFilled
          size={18}
          stroke={1.5}
          className="min-w-[30px] flex-none"
        />
      )}
    </div>
  )
}

export default CodeViewerSidebar
