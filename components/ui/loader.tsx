"use client"

import { LoadingSVG } from "@/components/icons/loading-svg"
import { FC } from "react"

interface LoaderProps {}

export const Loader: FC<LoaderProps> = () => {
  return (
    <div className="flex size-full flex-col items-center justify-center">
      <LoadingSVG className="size-12" />
    </div>
  )
}
