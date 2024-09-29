import { Loader } from "@/components/ui/loader"

export default function Loading() {
  return (
    <div className="flex size-full flex-col items-center justify-center">
      <Loader withMessage={true} />
    </div>
  )
}
