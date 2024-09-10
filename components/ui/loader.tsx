import { IconLoader2 } from "@tabler/icons-react"
import { FC } from "react"

interface LoaderProps {}

export const Loader: FC<LoaderProps> = () => {
  return (
    <div className="flex size-full flex-col items-center justify-center">
      <IconLoader2 className="mt-4 size-12 animate-spin" />
    </div>
  )
}
