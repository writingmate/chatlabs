import { Annotation } from "@/types/annotation"
import Image from "next/image"

export default function AnnotationImage({
  annotation
}: {
  annotation: Annotation
}) {
  const imageParams = annotation.imageGenerator__generateImage!
  return (
    <img
      src={imageParams.url!}
      alt={imageParams.prompt}
      className="mb-4 w-1/2 rounded-md sm:w-1/3"
    />
  )
}
