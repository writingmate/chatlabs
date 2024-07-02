"use client"
import { getFileById } from "@/db/files"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChatbotUISVG } from "@/components/icons/chatbotui-svg"

export default async function SharePage({
  params: { file_id }
}: {
  params: {
    file_id: string
  }
}) {
  const file = await getFileById(file_id)

  if (
    !file ||
    file.type != "html" ||
    file.sharing != "public" ||
    file.file_items.length == 0
  ) {
    return notFound()
  }

  function addNoFollowToAllLinks(html: string) {
    const parser = new DOMParser()
    const dom = parser.parseFromString(html, "text/html")

    const links = dom.querySelectorAll("a")

    links.forEach(link => {
      link.rel = "nofollow"
    })

    return dom.documentElement.outerHTML
  }

  const html = addNoFollowToAllLinks(file.file_items[0].content)

  return (
    <div className={"relative size-full"}>
      <iframe className={"size-full border-none pb-12"} srcDoc={html} />
      <div
        className={
          "absolute bottom-0 flex w-full items-center justify-center space-x-2 bg-violet-700 p-4 text-sm text-white"
        }
      >
        <div
          className={
            "flex items-center rounded-lg border border-white p-2 px-3"
          }
        >
          <a
            target={"_blank"}
            className={"font-semibold"}
            href={`https://labs.writingmate.ai/?utm_source=app_share&utm_medium=${file_id}`}
          >
            Build with ChatLabs No Code App Builder
          </a>
          <ChatbotUISVG scale={0.15} theme={"dark"} className={"ml-2"} />
        </div>
        <div></div>
      </div>
    </div>
  )
}
