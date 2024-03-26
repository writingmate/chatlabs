import { Annotation } from "@/types/annotation"
import { forwardRef, useRef } from "react"

type YouTubeProps = {
  annotation: Annotation
}
const YouTube = forwardRef<HTMLDivElement, YouTubeProps>(
  ({ annotation }: { annotation: Annotation }, ref) => {
    const { videoUrl, imageUrl } = annotation.webScraper__youtubeCaptions!
    const videoId = useRef("")

    if (videoUrl) {
      videoId.current = videoUrl.split("https://www.youtube.com/watch?v=")[1]
    } else {
      videoId.current = imageUrl
        .split("https://img.youtube.com/vi/")[1]
        .split("/")[0]
    }

    return (
      <div ref={ref} className={"flex w-full justify-center pb-4"}>
        <iframe
          className={"overflow-hidden rounded-md"}
          width="560"
          height="315"
          src={"https://www.youtube.com/embed/" + videoId.current}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
    )
  }
)

YouTube.displayName = "YouTube"

export { YouTube }
