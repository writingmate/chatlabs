import { ChatbotUIContext } from "@/context/context"
import { FC, useContext } from "react"
import { AssistantPicker } from "./assistant-picker"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { FilePicker } from "./file-picker"
import { PromptPicker } from "./prompt-picker"
import { ToolPicker } from "./tool-picker"
import { cn } from "@/lib/utils"
import { MessageHistoryPicker } from "@/components/message-history-picker"
import { ChatbotUIChatContext } from "@/context/chat"

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
    focusAssistant,
    selectedAssistant,
    isPromptPickerOpen,
    isToolPickerOpen,
    isAssistantPickerOpen,
    setIsAssistantPickerOpen,
    isMessageHistoryPickerOpen,
    atCommand
  } = useContext(ChatbotUIContext)

  const {
    handleSelectUserFile,
    handleSelectUserCollection,
    handleSelectAssistant
  } = usePromptAndCommand()

  const isOpen =
    isPromptPickerOpen ||
    isToolPickerOpen ||
    isAssistantPickerOpen ||
    isFilePickerOpen ||
    isMessageHistoryPickerOpen

  return (
    <div
      className={cn(
        "bg-background absolute bottom-10 left-0 mb-3 max-h-[300px] w-full overflow-y-auto rounded-xl border dark:border-none",
        selectedAssistant && "bottom-10",
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

      {isAssistantPickerOpen && (
        <AssistantPicker
          isOpen={isAssistantPickerOpen}
          onOpenChange={setIsAssistantPickerOpen}
          searchQuery={atCommand}
          onSelectAssistant={handleSelectAssistant}
          isFocused={focusAssistant}
        />
      )}

      <MessageHistoryPicker />
    </div>
  )
}
