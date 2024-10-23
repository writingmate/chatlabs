import { forwardRef, HTMLAttributes, ImgHTMLAttributes, useState } from "react"
import Image, { ImageProps } from "next/image"
import { IconDownload } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { FilePreview } from "@/components/ui/file-preview"

import { Button } from "../ui/button"

const ImageWithPreview = forwardRef<
  HTMLImageElement,
  ImgHTMLAttributes<HTMLImageElement>
>(({ src, ...props }, ref) => {
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!src) return

    setIsDownloading(true)

    try {
      const response = await fetch(
        `/api/image/download?url=${encodeURIComponent(src)}`
      )
      if (!response.ok) throw new Error("Network response was not ok")

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `image_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Download failed:", error)
      // You might want to show an error message to the user here
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <span
      className={cn(
        "relative flex w-1/2 cursor-pointer overflow-hidden rounded-lg border"
      )}
    >
      <img
        ref={ref}
        onClick={() => setShowImagePreview(true)}
        className="my-0"
        src={src}
        {...props}
      />
      <Button
        loading={isDownloading}
        disabled={isDownloading}
        className={cn(
          "absolute right-2 top-2 size-8 cursor-pointer rounded-md bg-black bg-opacity-30 p-1 text-white transition-opacity duration-200"
        )}
        onClick={isDownloading ? undefined : handleDownload}
      >
        <IconDownload stroke={1.5} size={18} />
      </Button>
      {showImagePreview && (
        <FilePreview
          type="image"
          item={{
            messageId: "",
            path: "",
            base64: "",
            url: src as string,
            file: null
          }}
          isOpen={showImagePreview}
          onOpenChange={(isOpen: boolean) => {
            setShowImagePreview(isOpen)
          }}
        />
      )}
    </span>
  )
})

ImageWithPreview.displayName = "ImageWithPreview"

export { ImageWithPreview }
