import { Loader } from "@/components/ui/loader"
import { IconLoader2 } from "@tabler/icons-react"

export default function Loading() {
  return (
    <div className="flex size-full flex-col items-center justify-center">
      <Loader withMessage={true} />
    </div>
  )
}
