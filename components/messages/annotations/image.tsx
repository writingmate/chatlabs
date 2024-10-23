import { useState } from "react"
import Image from "next/image"
import { IconDownload } from "@tabler/icons-react"

import { Annotation, Annotation2 } from "@/types/annotation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FilePreview } from "@/components/ui/file-preview"
import Loading from "@/components/ui/loading"

export default function AnnotationImage({
  annotation
}: {
  annotation: Annotation | Annotation2
}) {
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  let result = annotation.imageGenerator__generateImage

  if (!result) {
    return null
  }

  if ("result" in result) {
    result = result.result
  }

  const scale = 0.5
  let width = 0,
    height = 0

  if (result.size) {
    width = parseInt(result.size?.split("x")[0]) * scale
    height = parseInt(result.size?.split("x")[1]) * scale
  }

  const handleDownload = async () => {
    if (!result || !("url" in result) || !result.url) {
      return
    }

    setIsDownloading(true)

    try {
      const response = await fetch(
        `/api/image/download?url=${encodeURIComponent(result.url)}`
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
    <div
      className={cn(
        "relative my-4 items-center",
        width > height ? "w-2/3" : "w-1/2"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={result.url!}
        alt={result.prompt}
        width={width}
        height={height}
        style={{ width: "100%", height: "auto" }}
        className="rounded-md"
        onClick={() => {
          setShowImagePreview(true)
        }}
      />
      {(isHovered || isDownloading) && (
        <Button
          loading={isDownloading}
          disabled={isDownloading}
          className={cn(
            "absolute right-2 top-2 cursor-pointer rounded-md bg-black bg-opacity-30 p-2 text-white transition-opacity duration-200"
          )}
          onClick={isDownloading ? undefined : handleDownload}
        >
          <IconDownload size={18} />
        </Button>
      )}
      {showImagePreview && (
        <FilePreview
          type="image"
          item={{
            messageId: "",
            path: "",
            base64: "",
            url: result.url,
            file: null
          }}
          isOpen={showImagePreview}
          onOpenChange={(isOpen: boolean) => {
            setShowImagePreview(isOpen)
          }}
        />
      )}
    </div>
  )
}
