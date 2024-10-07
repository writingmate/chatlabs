"use client"
import { ChatbotUIContext } from "@/context/context"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { CodeBlock, LLM, LLMID, MessageImage, ModelProvider } from "@/types"
import {
  IconApi,
  IconCaretDownFilled,
  IconCaretRightFilled,
  IconCircleFilled,
  IconFileText,
  IconMoodSmile,
  IconPuzzle,
  IconBulb
} from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react"
import { ModelIcon } from "../models/model-icon"
import { Button } from "../ui/button"
import { FileIcon } from "../ui/file-icon"
import { FilePreview } from "../ui/file-preview"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { WithTooltip } from "../ui/with-tooltip"
import { MessageActions } from "./message-actions"
import { MessageMarkdown } from "./message-markdown"
import { YouTube } from "@/components/messages/annotations/youtube"
import { WebSearch } from "@/components/messages/annotations/websearch"
import AnnotationImage from "@/components/messages/annotations/image"
import { Annotation, Annotation2 } from "@/types/annotation"
import { AssistantIcon } from "@/components/assistants/assistant-icon"
import { toast } from "sonner"
import { LoadingMessage } from "@/components/messages/message-loading"
import { CodeBlock as ChatMessageCodeBlock } from "@/types/chat-message"
import {
  ResponseTime,
  ToolCalls
} from "@/components/messages/annotations/toolCalls"
import { SelectedHtmlElements } from "@/components/messages/annotations/selectedHtmlElements"
import {
  reconstructContentWithCodeBlocks,
  reconstructContentWithCodeBlocksInChatMessage
} from "@/lib/messages"
import { getMessageImageFromStorage } from "@/db/storage/message-images"

const ICON_SIZE = 32

interface MessageProps {
  showActions?: boolean
  codeBlocks?: ChatMessageCodeBlock[]
  message: Tables<"messages">
  fileItems: Tables<"file_items">[]
  isEditing: boolean
  isLast: boolean
  onStartEdit?: (message: Tables<"messages">) => void
  onCancelEdit?: () => void
  onSubmitEdit?: (value: string, sequenceNumber: number) => void
  onRegenerate?: (editedMessage?: string) => void
  isGenerating: boolean
  firstTokenReceived: boolean
  setIsGenerating?: (value: boolean) => void
  onSelectCodeBlock?: (codeBlock: ChatMessageCodeBlock | null) => void
  isExperimentalCodeEditor?: boolean
  showResponseTime?: boolean
}

export const Message: FC<MessageProps> = ({
  isGenerating,
  firstTokenReceived,
  setIsGenerating,
  message,
  fileItems,
  isEditing,
  isLast,
  onStartEdit,
  onCancelEdit,
  onRegenerate,
  onSubmitEdit,
  onSelectCodeBlock,
  codeBlocks,
  isExperimentalCodeEditor,
  showActions = true,
  showResponseTime = false
}) => {
  const { assistants, profile, allModels, selectedAssistant, files } =
    useContext(ChatbotUIContext)

  const editInputRef = useRef<HTMLTextAreaElement>(null)

  const [editedMessage, setEditedMessage] = useState(message.content)

  const [showImagePreview, setShowImagePreview] = useState(false)
  const [selectedImage, setSelectedImage] = useState<MessageImage | null>(null)

  const [showFileItemPreview, setShowFileItemPreview] = useState(false)
  const [selectedFileItem, setSelectedFileItem] =
    useState<Tables<"file_items"> | null>(null)

  const [viewSources, setViewSources] = useState(false)

  const [isVoiceToTextPlaying, setIsVoiceToTextPlaying] = useState(false)

  const [images, setImages] = useState<string[]>([])

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleCopy = () => {
    const content = reconstructContentWithCodeBlocks(
      message.content,
      codeBlocks ?? []
    )
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content)
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }

  function cleanupMessageForSpeech(message: string) {
    const codeBlockRegex = /```[\s\S]*?```|(?:(?:^|\n)( {4}|\t).*)+/g
    return (
      message
        // remove any ``` code blocks
        .replace(codeBlockRegex, "see code example in the chat")
    )
  }

  const handleSpeakMessage = async () => {
    if (isVoiceToTextPlaying) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setIsVoiceToTextPlaying(false)
      return
    }

    if (profile?.plan !== "free") {
      // PRO plan users can use OpenAI voice to text
      await handleOpenAISpeech(cleanupMessageForSpeech(message.content))
    } else if ("speechSynthesis" in window) {
      if (window.speechSynthesis.paused) {
        // If speech synthesis is paused, resume it
        window.speechSynthesis.resume()
      } else if (!window.speechSynthesis.speaking) {
        // If speech synthesis is not speaking, start speaking the message
        speakMessage()
      } else {
        // If speech synthesis is speaking, pause it
        handlePauseSpeech()
      }
    } else {
      console.error("Speech synthesis is not supported in this browser.")
    }
  }

  const handleOpenAISpeech = async (text: string) => {
    try {
      setIsVoiceToTextPlaying(true)
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        throw new Error("Failed to generate speech")
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.pause()
      }
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => {
        setIsVoiceToTextPlaying(false)
      }
      audioRef.current.play()
    } catch (error) {
      console.error("Error in OpenAI text-to-speech:", error)
      toast.error("Failed to generate speech")
      setIsVoiceToTextPlaying(false)
    }
  }

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isVoiceToTextPlaying) {
        if (window.speechSynthesis) {
          window.speechSynthesis.pause()
        }
        if (audioRef.current) {
          audioRef.current.pause()
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isVoiceToTextPlaying])

  const speakMessage = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        cleanupMessageForSpeech(message.content)
      )
      utterance.onerror = () => {
        console.error("An error occurred while speaking the message.")
        setIsVoiceToTextPlaying(false)
      }
      utterance.onend = () => {
        setIsVoiceToTextPlaying(false)
      }
      utterance.onpause = () => {
        setIsVoiceToTextPlaying(false)
      }
      utterance.onresume = () => {
        setIsVoiceToTextPlaying(true)
      }
      utterance.onstart = () => {
        setIsVoiceToTextPlaying(true)
      }
      window.speechSynthesis.speak(utterance)
    } else {
      console.error("Speech synthesis is not supported in this browser.")
    }
  }

  const handlePauseSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause()
    }
  }

  const handleSendEdit = () => {
    onSubmitEdit?.(editedMessage, message.sequence_number)
    onCancelEdit?.()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isEditing && event.key === "Enter" && event.metaKey) {
      handleSendEdit()
    }
  }

  const handleRegenerate = async () => {
    setIsGenerating?.(true)
    onRegenerate?.(editedMessage)
  }

  const handleStartEdit = () => {
    onStartEdit?.(message)
  }

  useEffect(() => {
    setEditedMessage(message.content)

    if (isEditing && editInputRef.current) {
      const input = editInputRef.current
      input.focus()
      input.setSelectionRange(input.value.length, input.value.length)
    }
  }, [isEditing])

  useEffect(() => {
    if (message.image_paths.length > 0) {
      Promise.all(
        message.image_paths.map(filePath =>
          getMessageImageFromStorage(filePath).catch(() => null)
        )
      ).then(imagePaths => {
        setImages(imagePaths.filter(Boolean) as string[])
      })
    }
  }, [message])

  const MODEL_DATA = allModels.find(llm => llm.modelId === message.model) as LLM

  const fileAccumulator: Record<
    string,
    {
      id: string
      name: string
      count: number
      type: string
      description: string
    }
  > = {}

  const fileSummary = fileItems.reduce((acc, fileItem) => {
    const parentFile = files.find(file => file.id === fileItem.file_id)
    if (parentFile) {
      if (!acc[parentFile.id]) {
        acc[parentFile.id] = {
          id: parentFile.id,
          name: parentFile.name,
          count: 1,
          type: parentFile.type,
          description: parentFile.description
        }
      } else {
        acc[parentFile.id].count += 1
      }
    }
    return acc
  }, fileAccumulator)

  function Annotations({ annotation }: { annotation: Annotation }) {
    if (!annotation) {
      return null
    }

    if (Array.isArray(annotation)) {
      annotation = annotation.reduce((acc, item) => {
        acc = {
          ...acc,
          ...item
        }

        return acc
      }, {})
    }

    const annotationMap: {
      [key: string]: React.FC<{ annotation: Annotation | Annotation2 }>
    } = {
      // imageGenerator__generateImage: AnnotationImage,
      webScraper__youtubeCaptions: YouTube,
      webScraper__googleSearch: WebSearch,
      selected_html_elements: SelectedHtmlElements
    }

    if (showResponseTime) {
      annotationMap.toolCalls = ToolCalls
    }

    const annotationResponseTimeLabelMap: {
      [key: string]: string
    } = {
      imageGenerator__generateImage: "Image",
      webScraper__youtubeCaptions: "YouTube",
      webScraper__googleSearch: "Google Search"
    }

    return Object.keys(annotation).map(key => {
      if (!annotationMap[key]) {
        return null
      }
      const responseTimeLabel = annotationResponseTimeLabelMap[key]
      const AnnotationComponent = annotationMap[key]!
      // @ts-ignore
      const responseTime = responseTimeLabel ? annotation[key]?.responseTime : 0
      return (
        <div key={key} className={"flex flex-col space-y-3"}>
          <AnnotationComponent annotation={annotation} />
          {showResponseTime && responseTime > 0 && (
            <ResponseTime
              icon={<IconApi stroke={1.5} size={18} />}
              label={responseTimeLabel}
              // @ts-ignore
              value={responseTime}
            />
          )}
        </div>
      )
    })
  }

  let assistant =
    message.role === "assistant" && message.assistant_id
      ? assistants.find(assistant => assistant.id === message.assistant_id)
      : null

  if (!assistant && selectedAssistant) {
    assistant = selectedAssistant
  }

  return (
    <div
      className={cn(
        "group flex w-full justify-center",
        // message.role === "user" ? "" : "bg-secondary",
        "role-" + message.role,
        isLast ? "is-last" : ""
      )}
      onKeyDown={handleKeyDown}
    >
      <div className="relative flex w-full flex-col p-4">
        <div className="space-y-3">
          {message.role === "system" ? (
            <div className="flex items-center space-x-4">
              <IconBulb
                className="border-primary bg-primary text-secondary rounded border p-1"
                size={ICON_SIZE}
              />

              <div className="text-lg font-semibold">Prompt</div>
            </div>
          ) : (
            <div className="relative flex items-center space-x-3">
              {message.role === "assistant" ? (
                assistant ? (
                  <AssistantIcon
                    size={ICON_SIZE - 4}
                    className={`h-[${ICON_SIZE}px] w-[${ICON_SIZE}px]`}
                    assistant={assistant}
                  />
                ) : (
                  <WithTooltip
                    display={<div>{MODEL_DATA?.modelName}</div>}
                    trigger={
                      <ModelIcon
                        provider={MODEL_DATA?.provider || "custom"}
                        modelId={MODEL_DATA?.modelId}
                        height={ICON_SIZE}
                        width={ICON_SIZE}
                      />
                    }
                  />
                )
              ) : profile?.image_url ? (
                <Image
                  className={`size-[32px] rounded`}
                  src={profile?.image_url}
                  height={32}
                  width={32}
                  alt="user image"
                />
              ) : (
                <IconMoodSmile
                  className="bg-primary text-secondary border-primary rounded border p-1"
                  size={ICON_SIZE}
                />
              )}

              <div className="font-semibold">
                {message.role === "assistant"
                  ? message.assistant_id
                    ? assistants.find(
                        assistant => assistant.id === message.assistant_id
                      )?.name
                    : selectedAssistant
                      ? selectedAssistant?.name
                      : MODEL_DATA?.modelName
                  : (profile?.display_name ?? profile?.username)}
              </div>
              {showActions && (
                <div className={"absolute right-0"}>
                  <MessageActions
                    isGenerating={isGenerating}
                    onCopy={handleCopy}
                    onEdit={handleStartEdit}
                    isAssistant={message.role === "assistant"}
                    isLast={isLast}
                    isEditing={isEditing}
                    onRegenerate={handleRegenerate}
                    isVoiceToTextPlaying={isVoiceToTextPlaying}
                    onVoiceToText={() => {
                      // TODO: figure out await and Promise
                      handleSpeakMessage()
                    }}
                  />
                </div>
              )}
            </div>
          )}
          <Annotations annotation={message.annotation as Annotation} />
          {!firstTokenReceived &&
          isGenerating &&
          isLast &&
          message.role === "assistant" ? (
            <LoadingMessage isGenerating={isGenerating} />
          ) : isEditing ? (
            <TextareaAutosize
              textareaRef={editInputRef}
              className="text-md"
              value={editedMessage}
              onValueChange={setEditedMessage}
              maxRows={20}
            />
          ) : (
            <MessageMarkdown
              isGenerating={isGenerating && isLast}
              codeBlocks={codeBlocks}
              content={message.content}
              onSelectCodeBlock={onSelectCodeBlock}
              experimental_code_editor={isExperimentalCodeEditor}
            />
          )}
        </div>

        {fileItems.length > 0 && (
          <div className="border-primary mt-6 border-t pt-4 font-semibold">
            {!viewSources ? (
              <div
                className="flex cursor-pointer items-center text-lg hover:opacity-50"
                onClick={() => setViewSources(true)}
              >
                {fileItems.length}
                {fileItems.length > 1 ? " Sources " : " Source "}
                from {Object.keys(fileSummary).length}{" "}
                {Object.keys(fileSummary).length > 1 ? "Files" : "File"}{" "}
                <IconCaretRightFilled className="ml-1" />
              </div>
            ) : (
              <>
                <div
                  className="flex cursor-pointer items-center text-lg hover:opacity-50"
                  onClick={() => setViewSources(false)}
                >
                  {fileItems.length}
                  {fileItems.length > 1 ? " Sources " : " Source "}
                  from {Object.keys(fileSummary).length}{" "}
                  {Object.keys(fileSummary).length > 1 ? "Files" : "File"}{" "}
                  <IconCaretDownFilled className="ml-1" />
                </div>

                <div className="mt-3 space-y-4">
                  {Object.values(fileSummary).map((file, index) => (
                    <div key={index}>
                      <div className="flex items-center space-x-2">
                        <div>
                          <FileIcon type={file.type} />
                        </div>

                        <div className="truncate">{file.name}</div>
                      </div>

                      {fileItems
                        .filter(fileItem => {
                          const parentFile = files.find(
                            parentFile => parentFile.id === fileItem.file_id
                          )
                          return parentFile?.id === file.id
                        })
                        .map((fileItem, index) => (
                          <div
                            key={index}
                            className="ml-8 mt-1.5 flex cursor-pointer items-center space-x-2 hover:opacity-50"
                            onClick={() => {
                              setSelectedFileItem(fileItem)
                              setShowFileItemPreview(true)
                            }}
                          >
                            <div className="text-sm font-normal">
                              <span className="mr-1 text-lg font-semibold">
                                -
                              </span>{" "}
                              {fileItem.content.substring(0, 200)}...
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {images.map((path, index) => {
              return (
                <Image
                  key={index}
                  className="cursor-pointer rounded hover:opacity-50"
                  src={path}
                  alt="message image"
                  width={300}
                  height={300}
                  onClick={() => {
                    setSelectedImage({
                      messageId: message.id,
                      path,
                      base64: "",
                      url: path,
                      file: null
                    })

                    setShowImagePreview(true)
                  }}
                  loading="lazy"
                />
              )
            })}
          </div>
        )}
        {isEditing && (
          <div className="mt-4 flex justify-center space-x-2">
            <Button size="sm" onClick={handleSendEdit}>
              Save & Send
            </Button>

            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {showImagePreview && selectedImage && (
        <FilePreview
          type="image"
          item={selectedImage}
          isOpen={showImagePreview}
          onOpenChange={(isOpen: boolean) => {
            setShowImagePreview(isOpen)
            setSelectedImage(null)
          }}
        />
      )}

      {showFileItemPreview && selectedFileItem && (
        <FilePreview
          type="file_item"
          item={selectedFileItem}
          isOpen={showFileItemPreview}
          onOpenChange={(isOpen: boolean) => {
            setShowFileItemPreview(isOpen)
            setSelectedFileItem(null)
          }}
        />
      )}
    </div>
  )
}
