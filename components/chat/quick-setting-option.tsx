import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { Tables } from "@/supabase/types"
import { IconCircleCheckFilled, IconRobotFace } from "@tabler/icons-react"
import Image from "next/image"
import { FC } from "react"
import { ModelIcon } from "../models/model-icon"
import { DropdownMenuItem } from "../ui/dropdown-menu"
import { AssistantIcon } from "@/components/assistants/assistant-icon"

interface QuickSettingOptionProps {
  contentType: "presets" | "assistants"
  isSelected: boolean
  item: Tables<"presets"> | Tables<"assistants">
  onSelect: () => void
  image: string
}

export const QuickSettingOption: FC<QuickSettingOptionProps> = ({
  contentType,
  isSelected,
  item,
  onSelect,
  image
}) => {
  return (
    <DropdownMenuItem
      tabIndex={0}
      className="cursor-pointer items-center"
      onSelect={onSelect}
    >
      <div className="w-[32px]">
        <AssistantIcon assistant={item as Tables<"assistants">} size={32} />
        {/*{contentType === "presets" ? (*/}
        {/*  <ModelIcon*/}
        {/*    provider={modelDetails?.provider || "custom"}*/}
        {/*    modelId={modelDetails?.modelId}*/}
        {/*    width={32}*/}
        {/*    height={32}*/}
        {/*  />*/}
        {/*) : image ? (*/}
        {/*  <Image*/}
        {/*    style={{ width: "32px", height: "32px", maxWidth: "none" }}*/}
        {/*    className="rounded"*/}
        {/*    src={image}*/}
        {/*    placeholder="blur"*/}
        {/*    blurDataURL={PLACEHOLDER_IMAGE}*/}
        {/*    alt={item.name}*/}
        {/*    width={32}*/}
        {/*    height={32}*/}
        {/*  />*/}
        {/*) : (*/}
        {/*  <AssistantIcon assistant={item as Tables<"assistants">} size={32} />*/}
        {/*)}*/}
      </div>

      <div className="ml-4 flex grow flex-col space-y-1">
        <div className="text-md font-bold">{item.name}</div>

        {item.description && (
          <div className="line-clamp-2 text-ellipsis text-sm font-light">
            {item.description}
          </div>
        )}
      </div>

      <div className="min-w-[40px]">
        {isSelected ? (
          <IconCircleCheckFilled className="ml-4" size={20} />
        ) : null}
      </div>
    </DropdownMenuItem>
  )
}
