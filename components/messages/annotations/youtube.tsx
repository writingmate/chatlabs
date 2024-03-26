import { Annotation } from "@/types/annotation"
import { forwardRef, useRef } from "react"
import { IconPlayerPlay } from "@tabler/icons-react"

type YouTubeProps = {
  annotation: Annotation
}
const YouTube = forwardRef<HTMLAnchorElement, YouTubeProps>(
  ({ annotation }: { annotation: Annotation }, ref) => {
    const { videoUrl, imageUrl } = annotation.webScraper__youtubeCaptions!

    return (
      <a
        href={videoUrl}
        target={"_blank"}
        ref={ref}
        className={"relative mb-4 flex w-1/4 justify-start"}
      >
        <div
          className={
            "absolute bottom-2 right-2 flex items-center text-xs font-semibold text-white"
          }
        >
          <div className={"w-[16px]"}>
            <IconPlayerPlay size={16} className={"mr-1"} />
          </div>
        </div>
        <img
          alt={videoUrl}
          className={"overflow-hidden rounded-md"}
          src={imageUrl}
        />
      </a>
    )
  }
)

YouTube.displayName = "YouTube"

export { YouTube }
