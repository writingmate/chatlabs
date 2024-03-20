import { ChatbotUIContext } from "@/context/context"
import { FC, useContext } from "react"
import { AssistantPicker } from "./assistant-picker"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { FilePicker } from "./file-picker"
import { PromptPicker } from "./prompt-picker"
import { ToolPicker } from "./tool-picker"
import { cn } from "@/lib/utils"
import { MessageHistoryPicker } from "@/components/message-history-picker"

interface ChatCommandInputProps {}

export const ChatCommandInput: FC<ChatCommandInputProps> = ({}) => {
  const {
    newMessageFiles,
    chatFiles,
    slashCommand,
    isFilePickerOpen,
    setIsFilePickerOpen,
    hashtagCommand,
    focusPrompt,
    focusFile,
    selectedAssistant,
    isPromptPickerOpen,
    isToolPickerOpen,
    isAssistantPickerOpen,
    isMessageHistoryPickerOpen
  } = useContext(ChatbotUIContext)

  const { handleSelectUserFile, handleSelectUserCollection } =
    usePromptAndCommand()

  const isOpen =
    isPromptPickerOpen ||
    isToolPickerOpen ||
    isAssistantPickerOpen ||
    isFilePickerOpen ||
    isMessageHistoryPickerOpen

  return (
    <div
      className={cn(
        "bg-background absolute bottom-[76px] left-0 max-h-[300px] w-full overflow-y-auto rounded-xl border dark:border-none",
        selectedAssistant && "bottom-[106px]",
        isOpen ? "block" : "hidden"
      )}
    >
      <PromptPicker />

      <FilePicker
        isOpen={isFilePickerOpen}
        searchQuery={hashtagCommand}
        onOpenChange={setIsFilePickerOpen}
        selectedFileIds={[...newMessageFiles, ...chatFiles].map(
          file => file.id
        )}
        selectedCollectionIds={[]}
        onSelectFile={handleSelectUserFile}
        onSelectCollection={handleSelectUserCollection}
        isFocused={focusFile}
      />
      <ToolPicker />

      <AssistantPicker />
    </div>
  )
}
