import { Annotation, Annotation2 } from "@/types/annotation"
import Image from "next/image"
import { FilePreview } from "@/components/ui/file-preview"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function AnnotationImage({
  annotation
}: {
  annotation: Annotation | Annotation2
}) {
  const [showImagePreview, setShowImagePreview] = useState(false)

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

  return (
    <div
      className={cn("my-4 items-center", width > height ? "w-2/3" : "w-1/2")}
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
