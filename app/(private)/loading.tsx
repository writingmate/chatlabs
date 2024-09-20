import { LoadingSVG } from "@/components/icons/loading-svg"

export default function Loading() {
  return (
    <div className="flex size-full min-h-screen flex-col items-center justify-center">
      <LoadingSVG className="size-12" />
    </div>
  )
}
