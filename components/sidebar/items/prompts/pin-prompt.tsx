import { Tables } from "@/supabase/types"
import { IconPin } from "@tabler/icons-react"
import { FC } from "react"
import { cn } from "@/lib/utils"
import { updatePrompt } from "@/db/prompts"

interface UpdatePromptProps {
  prompt: Tables<"prompts">
  className?: string
  setPrompts: React.Dispatch<React.SetStateAction<Tables<"prompts">[]>>
}

export const PinPrompt: FC<UpdatePromptProps> = ({
  prompt,
  className,
  setPrompts
}) => {
  const handlePinPrompt = async (e: React.MouseEvent<SVGSVGElement>) => {
    const updatedPrompt = await updatePrompt(prompt.id, {
      pinned: !prompt.pinned,
      updated_at: prompt.updated_at
    })
    setPrompts(prevState =>
      prevState.map(c => (c.id === prompt.id ? updatedPrompt : c))
    )
  }

  return (
    <IconPin
      className={cn("hover:opacity-50", className)}
      size={18}
      onClick={handlePinPrompt}
    />
  )
}
