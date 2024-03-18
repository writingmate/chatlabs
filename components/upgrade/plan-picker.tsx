import { ChatbotUIContext } from "@/context/context"
import { IconCheck } from "@tabler/icons-react"
import { FC, ReactNode, useContext } from "react"
import { Dialog, DialogContent } from "../ui/dialog"
import Plans from "@/components/upgrade/plans"

interface PlanPickerProps {}

export function PlanFeature({ title }: { title: string | ReactNode }) {
  return (
    <div className="bg-token-main-surface-primary relative">
      <div className="text-l flex justify-start gap-2">
        <div className="w-8 shrink-0">
          <IconCheck size={18} />
        </div>
        <span>{title}</span>
      </div>
    </div>
  )
}

export const PlanPicker: FC<PlanPickerProps> = () => {
  const { isPaywallOpen, setIsPaywallOpen } = useContext(ChatbotUIContext)

  return (
    <Dialog open={isPaywallOpen} onOpenChange={setIsPaywallOpen}>
      <DialogContent className="sm:max-w-2xl sm:border">
        <Plans onClose={() => setIsPaywallOpen(false)} showCloseIcon={true} />
      </DialogContent>
    </Dialog>
  )
}
