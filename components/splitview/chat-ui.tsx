import Loading from "@/components/ui/loading"
import { useChatHandler } from "@/components/splitview/splitview-hooks/use-chat-handler"
import {
  FC,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react"
import { ChatInput } from "@/components/splitview/chat-input"
import { ChatMessages } from "@/components/splitview/chat-messages"
import { useScroll } from "@/components/splitview/splitview-hooks/use-scroll"
import { ChatSettings } from "@/components/splitview/chat-settings"
import { ChatbotUIChatContext, ChatbotUIChatProvider } from "@/context/chat"
import { ChatMessage, LLMID, ModelProvider } from "@/types"
import { ChatbotUIContext } from "@/context/context"
import { cn } from "@/lib/utils"
import {
  IconApps,
  IconDashboard,
  IconGauge,
  IconGrid4x4,
  IconLayoutGrid
} from "@tabler/icons-react"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { ModelDetails } from "@/components/models/model-details"
import { ResizableSplitView } from "./chat-resizable-split-view"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "@/components/ui/select"

interface ChatUIProps {}

function getResponseTimePadding(annotations: any) {
  if (!annotations?.length) return 0
  return (
    annotations
      ?.map((annotation: any) =>
        Object.keys(annotation).map(x => {
          if ("responseTime" in annotation[x]) {
            return parseInt(annotation[x].responseTime)
          }
          return 0
        })
      )
      .flat()
      .reduce((a: number, b: number) => a + b, 0) / 1000
  )
}

interface ChatMessagesRef {
  handleSendEdit: (message: string) => void
  handleStopMessage: () => void
  handleSendMessage: (input: string, isRegeneration: boolean) => void
  handleReset: () => void
}

const ChatWrapper = forwardRef(
  (
    {
      onGeneratingChange,
      onModelChange,
      onChatMessagesChange
    }: {
      onChatMessagesChange?: (chatMessages: ChatMessage[]) => void
      onGeneratingChange?: (isGenerating: boolean) => void
      onModelChange?: (model: any) => void
    },
    ref
  ) => {
    const { messagesStartRef, messagesEndRef, handleScroll } = useScroll()
    const { allModels } = useContext(ChatbotUIContext)
    const { handleSendEdit, handleStopMessage, handleSendMessage } =
      useChatHandler()
    const {
      isGenerating,
      chatMessages,
      chatSettings,
      selectedTools,
      requestTokensTotal,
      responseTimeToFirstToken,
      responseTokensTotal,
      responseTimeTotal,
      setChatMessages,
      setResponseTimeTotal,
      setResponseTokensTotal,
      setRequestTokensTotal,
      setResponseTimeToFirstToken
    } = useContext(ChatbotUIChatContext)

    console.log(selectedTools)

    const responseTimePadding = getResponseTimePadding(
      chatMessages[chatMessages.length - 1]?.message.annotation
    )

    const selectedModel = allModels.find(
      x =>
        x.modelId === chatSettings?.model || x.hostedId === chatSettings?.model
    )

    useImperativeHandle(
      ref,
      () => ({
        handleSendEdit,
        handleStopMessage,
        handleSendMessage: (input: string, isRegeneration: boolean) =>
          handleSendMessage(input, chatMessages, isRegeneration),
        handleReset: () => {
          setResponseTimeTotal(0)
          setResponseTokensTotal(0)
          setRequestTokensTotal(0)
          setResponseTimeToFirstToken(0)
          setChatMessages([])
        }
      }),
      [selectedModel]
    )

    useEffect(() => {
      onGeneratingChange?.(isGenerating)
      onModelChange?.(selectedModel)
      onChatMessagesChange?.(chatMessages)
    }, [selectedModel, isGenerating, chatSettings, chatMessages])

    const cost = (
      (requestTokensTotal * (selectedModel?.pricing?.inputCost || 0)) /
        1000000 +
      (responseTokensTotal *
        (selectedModel?.pricing?.outputCost ||
          selectedModel?.pricing?.inputCost ||
          0)) /
        10000
    ).toFixed(6)

    return (
      <div className={"flex h-full flex-col overflow-hidden"}>
        <ChatSettings
          detailsLocation={"right"}
          className="w-auto border-b py-1 pr-2"
        />
        <div
          className="flex grow flex-col overflow-auto p-4"
          onScroll={handleScroll}
        >
          <div ref={messagesStartRef} />
          {chatMessages.length > 0 ? (
            <ChatMessages />
          ) : (
            selectedModel && (
              <ModelDetails
                className={"m-auto rounded-md border p-4"}
                model={selectedModel}
                selectedTools={selectedTools}
              />
            )
          )}

          <div ref={messagesEndRef} />
        </div>
        <div
          className={"flex items-center border-t px-2 py-3 font-mono text-xs"}
        >
          <div className={"border-r px-2"}>
            <IconGauge stroke={1.5} size={18} />
          </div>
          <div
            className={
              "hidden max-w-[25%] overflow-hidden text-ellipsis text-nowrap border-r px-2 xl:block"
            }
          >
            {(responseTimeToFirstToken - responseTimePadding).toFixed(1)}{" "}
            <span className={"text-foreground/70"}>sec to first token</span>
          </div>
          <div
            className={
              "max-w-[25%] overflow-hidden text-ellipsis text-nowrap border-r px-2 xl:max-w-[20%]"
            }
          >
            {(responseTokensTotal > 0
              ? responseTokensTotal / (responseTimeTotal - responseTimePadding)
              : 0
            ).toFixed(2)}{" "}
            <span className={"text-foreground/70"}>tokens/sec</span>
          </div>
          <div
            className={
              "max-w-[25%] overflow-hidden text-ellipsis text-nowrap border-r px-2 xl:max-w-[15%]"
            }
          >
            {responseTokensTotal}{" "}
            <span className={"text-foreground/70"}>tokens</span>
          </div>
          <div
            className={
              "max-w-[25%] overflow-hidden text-ellipsis text-nowrap border-r px-2 xl:max-w-[15%]"
            }
          >
            {(responseTimeTotal - responseTimePadding).toFixed(2)}{" "}
            <span className={"text-foreground/70"}>sec</span>
          </div>
          <div
            className={
              "max-w-[25%] overflow-hidden text-ellipsis text-nowrap px-2 xl:max-w-[15%]"
            }
          >
            <WithTooltip
              display={
                <div className={"flex items-center"}>
                  {responseTokensTotal} output tokens * ¢
                  {(
                    (selectedModel?.pricing?.outputCost ||
                      selectedModel?.pricing?.inputCost ||
                      0) / 10000
                  ).toFixed(6)}{" "}
                  + {requestTokensTotal} input tokens * ¢
                  {((selectedModel?.pricing?.inputCost || 0) / 10000).toFixed(
                    6
                  )}{" "}
                  = ¢{cost}
                </div>
              }
              trigger={<>¢{cost}</>}
            />
          </div>
        </div>
      </div>
    )
  }
)

ChatWrapper.displayName = "ChatWrapper"

function range(size: number, startAt = 0) {
  return [...Array(size).keys()].map(i => i + startAt)
}

export const ChatUI: FC<ChatUIProps> = () => {
  const [chatsSize, setChatsSize] = useState(2)
  const { newMessageImages, newMessageFiles, chatImages, chatFiles } =
    useContext(ChatbotUIContext)

  const [hasMessagesArray, setHasMessagesArray] = useState<boolean[]>(
    new Array(6).fill(false)
  )

  const [isGeneratingArray, setIsGeneratingArray] = useState<boolean[]>(
    new Array(6).fill(false)
  )
  const [toolsAllowedArray, setToolsAllowedArray] = useState<boolean[]>(
    new Array(6).fill(false)
  )
  const [imagesAllowedArray, setImagesAllowedArray] = useState<boolean[]>(
    new Array(6).fill(false)
  )

  const chatMessagesRef = useRef<ChatMessagesRef[]>([])

  const handleSendMessage = (input: string, isRegeneration: boolean) => {
    chatMessagesRef.current.forEach(ref => {
      if (ref?.handleSendMessage) {
        ref.handleSendMessage(input, isRegeneration)
      }
    })
  }

  const handleReset = () => {
    chatMessagesRef.current.forEach(ref => {
      if (ref?.handleReset) {
        ref.handleReset()
      }
    })
  }

  const handleStopMessage = () => {
    chatMessagesRef.current.forEach(ref => {
      try {
        if (ref?.handleStopMessage) {
          ref.handleStopMessage()
        }
      } catch (e) {
        console.error(e)
      }
    })
  }

  const renderChatWrappers = () => {
    return range(chatsSize).map(index => (
      <ChatbotUIChatProvider key={index} id={index.toString()}>
        <ChatWrapper
          ref={(ref: ChatMessagesRef) => {
            chatMessagesRef.current[index] = ref
          }}
          onChatMessagesChange={(chatMessages: ChatMessage[]) => {
            setHasMessagesArray(prevState => {
              const newState = [...prevState]
              newState[index] = chatMessages.length > 0
              return newState
            })
          }}
          onGeneratingChange={isGenerating => {
            setIsGeneratingArray(prevState => {
              const newState = [...prevState]
              newState[index] = isGenerating
              return newState
            })
          }}
          onModelChange={model => {
            setToolsAllowedArray(prevState => {
              const newState = [...prevState]
              newState[index] = !!model?.tools
              return newState
            })
            setImagesAllowedArray(prevState => {
              const newState = [...prevState]
              newState[index] = !!model?.imageInput
              return newState
            })
          }}
        />
      </ChatbotUIChatProvider>
    ))
  }

  return (
    <div className="flex size-full flex-col px-6 pt-4">
      <ResizableSplitView
        className={cn(
          "max-h-[calc(100%-84px)]",
          newMessageImages.length > 0 || newMessageFiles.length > 0
            ? "max-h-[calc(100%-134px)]"
            : ""
        )}
        numViews={chatsSize}
      >
        {renderChatWrappers()}
      </ResizableSplitView>
      <div className="relative mx-auto flex w-full items-center justify-between space-x-2 px-4 sm:w-[400px] md:w-[500px] lg:w-[660px] xl:w-[800px]">
        <ChatInput
          className="grow"
          hasMessages={hasMessagesArray.some(x => x)}
          toolsAllowed={false}
          imagesAllowed={imagesAllowedArray.every(x => x)}
          isGenerating={isGeneratingArray.some(x => x)}
          handleSendMessage={handleSendMessage}
          handleStopMessage={handleStopMessage}
          handleReset={handleReset}
        />
        <div className="w-18 h-full shrink-0 py-3">
          <Select onValueChange={value => setChatsSize(parseInt(value))}>
            <SelectTrigger
              className={"flex h-full items-center justify-center rounded-xl"}
            >
              <IconLayoutGrid size={20} stroke={1.5} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="6">6</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
