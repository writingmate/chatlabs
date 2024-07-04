"use client"
import { getFileByHashId } from "@/db/files"
import { notFound } from "next/navigation"
import { ChatbotUISVG } from "@/components/icons/chatbotui-svg"
import { IconExternalLink } from "@tabler/icons-react"

export default async function SharePage({
  params: { file_id }
}: {
  params: {
    file_id: string
  }
}) {
  const file = await getFileByHashId(file_id)

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
      <iframe
        sandbox={"allow-scripts"}
        className={"size-full border-none pb-[60px]"}
        srcDoc={html}
      />
      <div
        className={
          "absolute bottom-0 flex h-[60px] w-full items-center justify-center space-x-1 bg-violet-700 text-sm text-white"
        }
      >
        Built with
        <div className={"flex items-center space-x-1 px-1"}>
          <a
            target={"_blank"}
            className={"font-semibold hover:underline"}
            href={`https://labs.writingmate.ai/?utm_source=app_share&utm_medium=${file_id}`}
          >
            ChatLabs No Code App Builder
          </a>
          <IconExternalLink stroke={1.5} size={16} />
        </div>
      </div>
    </div>
  )
}
