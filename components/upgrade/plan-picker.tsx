"use client"
import { ChatbotUIContext } from "@/context/context"
import { IconCheck, IconCircleCheck } from "@tabler/icons-react"
import { FC, ReactNode, useContext } from "react"
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog"
import Plans from "@/components/upgrade/plans"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
interface PlanPickerProps {}

export function PlanFeature({
  title,
  icon = <IconCircleCheck size={18} />
}: {
  title: string | ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="bg-token-main-surface-primary relative">
      <div className="text-l flex justify-start gap-2">
        <div className="w-5 shrink-0">{icon}</div>
        <span>{title}</span>
      </div>
    </div>
  )
}

export const PlanPicker: FC<PlanPickerProps> = () => {
  const { isPaywallOpen, setIsPaywallOpen } = useContext(ChatbotUIContext)

  return (
    <Dialog open={isPaywallOpen} onOpenChange={setIsPaywallOpen}>
      <VisuallyHidden>
        <DialogTitle></DialogTitle>
      </VisuallyHidden>
      <DialogContent className="sm:max-w-2xl sm:border">
        <Plans onClose={() => setIsPaywallOpen(false)} showCloseIcon={true} />
      </DialogContent>
    </Dialog>
  )
}
