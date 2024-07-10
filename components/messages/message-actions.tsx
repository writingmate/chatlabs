import { ChatbotUIContext } from "@/context/context"
import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconRepeat,
  IconMicrophone,
  IconPlayerRecordFilled,
  IconPlayerPlay,
  IconPlayerStop,
  IconClipboard
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useState } from "react"
import { WithTooltip } from "../ui/with-tooltip"
import { ChatbotUIChatContext } from "@/context/chat"

export const MESSAGE_ICON_SIZE = 18

interface MessageActionsProps {
  isGenerating: boolean
  isAssistant: boolean
  isLast: boolean
  isEditing: boolean
  onCopy: () => void
  onEdit: () => void
  onRegenerate: () => void
  onVoiceToText: () => void
  isVoiceToTextPlaying?: boolean
}

export const MessageActions: FC<MessageActionsProps> = ({
  isGenerating,
  isAssistant,
  isLast,
  isEditing,
  onCopy,
  onEdit,
  onRegenerate,
  onVoiceToText,
  isVoiceToTextPlaying
}) => {
  const [showCheckmark, setShowCheckmark] = useState(false)

  const handleCopy = () => {
    onCopy()
    setShowCheckmark(true)
  }

  const handleForkChat = async () => {}

  useEffect(() => {
    if (showCheckmark) {
      const timer = setTimeout(() => {
        setShowCheckmark(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [showCheckmark])

  return (isLast && isGenerating) || isEditing ? null : (
    <div className="text-muted-foreground flex items-center space-x-2">
      {/* {((isAssistant && isHovering) || isLast) && (
        <WithTooltip
          delayDuration={1000}
          side="bottom"
          display={<div>Fork Chat</div>}
          trigger={
            <IconGitFork
              className="cursor-pointer hover:opacity-50"
              size={MESSAGE_ICON_SIZE}
              onClick={handleForkChat}
            />
          }
        />
      )} */}

      <WithTooltip
        delayDuration={1000}
        side="bottom"
        display={<div>Edit</div>}
        trigger={
          <IconEdit
            className="hidden cursor-pointer hover:opacity-50 group-hover:group-[.role-user]:block"
            size={MESSAGE_ICON_SIZE}
            onClick={onEdit}
          />
        }
      />

      <WithTooltip
        delayDuration={1000}
        side="bottom"
        display={<div>Play message</div>}
        trigger={
          isVoiceToTextPlaying ? (
            <IconPlayerStop
              className="hidden cursor-pointer hover:opacity-50 group-hover:block group-[.is-last]:block"
              size={MESSAGE_ICON_SIZE}
              onClick={onVoiceToText}
            />
          ) : (
            <IconPlayerPlay
              className="hidden cursor-pointer hover:opacity-50 group-hover:block group-[.is-last]:block"
              size={MESSAGE_ICON_SIZE}
              onClick={onVoiceToText}
            />
          )
        }
      />

      <WithTooltip
        delayDuration={1000}
        side="bottom"
        display={<div>Copy</div>}
        trigger={
          showCheckmark ? (
            <IconCheck size={MESSAGE_ICON_SIZE} />
          ) : (
            <IconClipboard
              className="hidden cursor-pointer hover:opacity-50 group-hover:block group-[.is-last]:block"
              size={MESSAGE_ICON_SIZE}
              onClick={handleCopy}
            />
          )
        }
      />

      <WithTooltip
        delayDuration={1000}
        side="bottom"
        display={<div>Regenerate</div>}
        trigger={
          <IconRepeat
            className="hidden cursor-pointer hover:opacity-50 group-[.is-last]:block"
            size={MESSAGE_ICON_SIZE}
            onClick={onRegenerate}
          />
        }
      />

      {/* {1 > 0 && isAssistant && <MessageReplies />} */}
    </div>
  )
}
