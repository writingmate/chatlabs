import { Annotation } from "@/types/annotation"
import Image from "next/image"

export default function AnnotationImage({
  annotation
}: {
  annotation: Annotation
}) {
  const imageParams = annotation.imageGenerator__generateImage!

  const scale = 0.5
  let width = 0,
    height = 0

  console.log(imageParams.size)

  if (imageParams.size) {
    width = parseInt(imageParams.size?.split("x")[0]) * scale
    height = parseInt(imageParams.size?.split("x")[1]) * scale
  }

  return (
    <div className={"my-4 w-1/2 sm:w-1/3"}>
      <a href={imageParams.url!} target={"_blank"}>
        <Image
          src={imageParams.url!}
          alt={imageParams.prompt}
          width={width}
          height={height}
          style={{ width: "100%", height: "auto" }}
          className="rounded-md"
        />
      </a>
    </div>
  )
}
