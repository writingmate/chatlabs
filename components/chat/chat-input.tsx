import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import {
  IconBolt,
  IconCirclePlus,
  IconPaperclip,
  IconPlayerStopFilled,
  IconSend,
  IconX,
  IconMicrophone,
  IconPlayerRecordFilled
} from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Input } from "../ui/input"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { ChatCommandInput } from "./chat-command-input"
import { ChatFilesDisplay } from "./chat-files-display"
import { useChatHandler } from "./chat-hooks/use-chat-handler"
import { useChatHistoryHandler } from "./chat-hooks/use-chat-history"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { useSelectFileHandler } from "./chat-hooks/use-select-file-handler"
import { toast } from "sonner"
import { AssistantIcon } from "@/components/assistants/assistant-icon"

interface ChatInputProps {}

export const ChatInput: FC<ChatInputProps> = ({}) => {
  const { t } = useTranslation()
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [transcript, setTranscript] = useState("")
  const [listening, setListening] = useState(false)
  const [
    browserSupportsSpeechRecognition,
    setBrowserSupportsSpeechRecognition
  ] = useState(false)
  const recognition = window.webkitSpeechRecognition
    ? new window.webkitSpeechRecognition()
    : null
  const {
    isAssistantPickerOpen,
    focusAssistant,
    setFocusAssistant,
    userInput,
    setUserInput,
    chatMessages,
    isGenerating,
    selectedPreset,
    selectedAssistant,
    setSelectedAssistant,
    focusPrompt,
    setFocusPrompt,
    focusFile,
    focusTool,
    setFocusTool,
    isToolPickerOpen,
    isPromptPickerOpen,
    setIsPromptPickerOpen,
    isFilePickerOpen,
    setFocusFile,
    chatSettings,
    selectedTools,
    setSelectedTools,
    assistantImages,
    profile
  } = useContext(ChatbotUIContext)

  const {
    chatInputRef,
    handleSendMessage,
    handleStopMessage,
    handleFocusChatInput
  } = useChatHandler()

  const { handleInputChange } = usePromptAndCommand()

  const { filesToAccept, handleSelectDeviceFile, isUploading } =
    useSelectFileHandler()

  const {
    setNewMessageContentToNextUserMessage,
    setNewMessageContentToPreviousUserMessage
  } = useChatHistoryHandler()

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      setBrowserSupportsSpeechRecognition(true)
    }
    setTimeout(() => {
      handleFocusChatInput()
    }, 200) // FIX: hacky
  }, [selectedPreset, selectedAssistant])

  function isSendShortcut(event: React.KeyboardEvent) {
    if (isGenerating) {
      return false
    }
    let shortcutPressed = event.key === "Enter" && !event.shiftKey
    if (profile?.send_message_on_enter === false) {
      shortcutPressed =
        event.key === "Enter" && (event.ctrlKey || event.metaKey)
    }
    return shortcutPressed
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isTyping && isSendShortcut(event) && !isUploading) {
      event.preventDefault()
      setIsPromptPickerOpen(false)
      handleSendMessage(userInput, chatMessages, false)
    }

    // Consolidate conditions to avoid TypeScript error
    if (
      isPromptPickerOpen ||
      isFilePickerOpen ||
      isToolPickerOpen ||
      isAssistantPickerOpen
    ) {
      if (
        event.key === "Tab" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault()
        // Toggle focus based on picker type
        if (isPromptPickerOpen) setFocusPrompt(!focusPrompt)
        if (isFilePickerOpen) setFocusFile(!focusFile)
        if (isToolPickerOpen) setFocusTool(!focusTool)
        if (isAssistantPickerOpen) setFocusAssistant(!focusAssistant)
      }
    }

    if (event.key === "ArrowUp" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToPreviousUserMessage()
    }

    if (event.key === "ArrowDown" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToNextUserMessage()
    }

    //use shift+ctrl+up and shift+ctrl+down to navigate through chat history
    if (event.key === "ArrowUp" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToPreviousUserMessage()
    }

    if (event.key === "ArrowDown" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToNextUserMessage()
    }

    if (
      isAssistantPickerOpen &&
      (event.key === "Tab" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown")
    ) {
      event.preventDefault()
      setFocusAssistant(!focusAssistant)
    }
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    const imagesAllowed = LLM_LIST.find(
      llm => llm.modelId === chatSettings?.model
    )?.imageInput

    const items = event.clipboardData.items
    for (const item of items) {
      if (item.type.indexOf("image") === 0) {
        if (!imagesAllowed) {
          toast.error(
            `Images are not supported for this model. Use models like GPT-4 Vision instead.`
          )
          return
        }
        const file = item.getAsFile()
        if (!file) return
        handleSelectDeviceFile(file)
      }
    }
  }
  let timeoutId: NodeJS.Timeout | undefined
  let isListening = false
  const startListening = () => {
    if (recognition) {
      recognition.onresult = (event: any) => {
        setTranscript(event.results[0][0].transcript)
        setUserInput(
          prevState => prevState + " " + event.results[0][0].transcript
        )

        // Reset the timeout whenever new speech is detected
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        // Set a new timeout to stop the recognition after 30 seconds of silence
        timeoutId = setTimeout(() => {
          if (recognition) {
            recognition.stop()
          }
        }, 30 * 1000) // 30 seconds
      }

      recognition.onend = (event: any) => {
        setListening(false)
        // Check if the recognition was stopped due to a timeout
        if (event.error === "no-speech") {
          // Restart the recognition
          startListening()
          isListening = false
        }
      }

      recognition.start()
      setListening(true)
      isListening = true
      recognition.continuous = true
      recognition.interimResults = true

      // Initial timeout to stop the recognition after 30 seconds of silence
      timeoutId = setTimeout(() => {
        if (recognition) {
          recognition.stop()
        }
      }, 30 * 1000) // 30 seconds
    }
  }

  const stopListening = () => {
    if (recognition) {
      clearTimeout(timeoutId)
      recognition.stop()
      setListening(false)
      isListening = false
    }
  }

  // Function to manually restart the recognition
  const restartListening = () => {
    if (!isListening) {
      startListening()
    }
  }
  return (
    <>
      <div className="flex flex-col flex-wrap justify-center gap-2">
        <ChatFilesDisplay />

        {/*{selectedTools &&*/}
        {/*  selectedTools.map((tool, index) => (*/}
        {/*    <div*/}
        {/*      key={index}*/}
        {/*      className="flex justify-center"*/}
        {/*      onClick={() =>*/}
        {/*        setSelectedTools(*/}
        {/*          selectedTools.filter(*/}
        {/*            selectedTool => selectedTool.id !== tool.id*/}
        {/*          )*/}
        {/*        )*/}
        {/*      }*/}
        {/*    >*/}
        {/*      <div*/}
        {/*        className="flex cursor-pointer items-center justify-center space-x-1 rounded-lg bg-purple-600 px-3 py-1 hover:opacity-50">*/}
        {/*        <IconBolt size={20}/>*/}

        {/*        <div>{tool.name}</div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  ))}*/}
      </div>

      <div className={"relative"}>
        <ChatCommandInput />
        <div className="border-input mt-3 flex min-h-[60px] w-full flex-col justify-end overflow-hidden rounded-xl border backdrop-blur-xl">
          {selectedAssistant && (
            <div className="bg-secondary flex items-center justify-between space-x-2 p-2 pl-4 pr-3">
              <div className={"flex items-center space-x-2"}>
                <AssistantIcon assistant={selectedAssistant} size={24} />
                <div className="text-sm font-bold">
                  Talking to {selectedAssistant.name}
                </div>
              </div>

              <IconX
                onClick={() => setSelectedAssistant(null)}
                className={
                  "hover:text-foreground/50 flex size-4 cursor-pointer items-center justify-center text-[10px]"
                }
              />
            </div>
          )}

          <div className={"relative my-2 flex items-center justify-center"}>
            <IconPaperclip
              className="absolute bottom-[4px] left-3 cursor-pointer p-1 hover:opacity-50"
              size={32}
              onClick={() => fileInputRef.current?.click()}
            />

            {/* Hidden input to select files from device */}
            <Input
              ref={fileInputRef}
              className="hidden"
              type="file"
              onChange={e => {
                if (!e.target.files) return
                handleSelectDeviceFile(e.target.files[0])
              }}
              accept={filesToAccept}
            />

            <TextareaAutosize
              textareaRef={chatInputRef}
              className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-md flex w-full resize-none rounded-md border-none bg-transparent px-14 py-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t(
                `Ask anything. Type "${profile?.assistant_command}" for assistants, "${profile?.prompt_command}" for prompts, "${profile?.files_command}" for files, and "${profile?.tools_command}" for plugins.`
              )}
              onValueChange={handleInputChange}
              value={userInput}
              minRows={1}
              maxRows={18}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onCompositionStart={() => setIsTyping(true)}
              onCompositionEnd={() => setIsTyping(false)}
            />
            <div className="absolute bottom-[6px] right-3 flex cursor-pointer justify-end space-x-2">
              {browserSupportsSpeechRecognition && (
                <button onClick={listening ? stopListening : restartListening}>
                  {listening ? (
                    <IconPlayerRecordFilled
                      className={"animate-pulse text-red-500"}
                      size={24}
                    />
                  ) : (
                    <IconMicrophone size={24} />
                  )}
                </button>
              )}
              {isGenerating ? (
                <IconPlayerStopFilled
                  className="hover:bg-background animate-pulse rounded bg-transparent p-1 hover:opacity-50"
                  onClick={handleStopMessage}
                  size={30}
                />
              ) : (
                <IconSend
                  className={cn(
                    "bg-primary text-secondary rounded-lg p-1 hover:opacity-50",
                    (!userInput || isUploading) &&
                      "opacity-md cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (!userInput || isUploading) return
                    handleSendMessage(userInput, chatMessages, false)
                  }}
                  size={30}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
