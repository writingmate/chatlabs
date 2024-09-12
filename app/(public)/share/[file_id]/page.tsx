import { getFileByHashId } from "@/db/files"
import { notFound } from "next/navigation"
import { IconExternalLink } from "@tabler/icons-react"
import { DOMParser } from "xmldom"
import RemixButton from "@/components/remix/remix-button"
import { REGEX_FILENAME } from "@/lib/preview"

interface SharePageProps {
  params: {
    file_id: string
  }
  searchParams: {
    __show_banner: string | boolean | undefined
  }
}

export async function generateMetadata({
  params: { file_id }
}: SharePageProps) {
  const file = await getFileByHashId(file_id)

  return {
    title: `${file?.name} - Created with ChatLabs`,
    description: file?.description
  }
}

function parseBoolean(value: string | boolean | undefined) {
  if (value === "true") {
    return true
  }
  if (value === "false") {
    return false
  }
  return !!value
}

const SharePage = async ({
  params: { file_id },
  searchParams: { __show_banner = true }
}: SharePageProps) => {
  const file = await getFileByHashId(file_id)
  const showBanner = parseBoolean(__show_banner)

  if (
    !file ||
    file.type != "html" ||
    file.sharing != "public" ||
    file.file_items.length == 0
  ) {
    return notFound()
  }

  function updateHtml(html: string) {
    try {
      // known valid css files to ignore
      const knownTailwind = "tailwindcss@2"
      const upgradeToTailwind = "https://cdn.tailwindcss.com"
      const knownDaisyui = "daisyui@4"
      const upgradeToDaisyui =
        "hhttps://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.min.css"

      html = html.replace(REGEX_FILENAME, "")
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")
      const head = doc.getElementsByTagName("head")[0]

      // replace daisyui with our own version if it in the document
      function replaceDaisyui(dom: Document) {
        const stylesheets = dom.getElementsByTagName("link")
        for (let i = 0; i < stylesheets.length; i++) {
          const stylesheet = stylesheets[i]
          if (stylesheet.getAttribute("rel") === "stylesheet") {
            if (stylesheet.getAttribute("href")?.includes(knownDaisyui)) {
              stylesheet.setAttribute("href", upgradeToDaisyui)
            }
          }
        }
      }

      function replaceTailwind(dom: Document) {
        const stylesheets = dom.getElementsByTagName("link")
        for (let i = 0; i < stylesheets.length; i++) {
          const stylesheet = stylesheets[i]
          if (stylesheet.getAttribute("href")?.includes(knownTailwind)) {
            const tailwindScriptElement = doc.createElement("script")
            tailwindScriptElement.setAttribute("src", upgradeToTailwind)
            dom.removeChild(stylesheet)
            head.insertBefore(tailwindScriptElement, head.firstChild)
          }
        }
      }

      function replaceLinks(dom: Document) {
        const links = dom.getElementsByTagName("link")
        for (let i = 0; i < links.length; i++) {
          const link = links[i]
          link.setAttribute("rel", "nofollow")
          if (link.getAttribute("href")?.startsWith("#")) {
            link.setAttribute(
              "href",
              `about:srcdoc${link.getAttribute("href")}`
            )
          }
        }
      }

      replaceDaisyui(doc)
      replaceTailwind(doc)
      replaceLinks(doc)

      const newHtml = doc.documentElement.toString()
      return newHtml
    } catch (e) {
      console.error("Unable to parse dom, returning html as is", e)
      return html
    }
  }

  return (
    <div className={"relative flex flex-col h-screen " + "w-screen"}>
      <iframe
        allow="clipboard-write"
        className={"w-full flex-1 border-none"}
        srcDoc={updateHtml(file.file_items[0].content)}
      />
      {showBanner && (
        <div
          className={
            "flex h-[60px] w-full items-center justify-center space-x-1 bg-violet-700 text-sm text-white"
          }
        >
          Built with
          <div className={"flex items-center space-x-1 px-1"}>
            <a
              target={"_blank"}
              className={"font-semibold hover:underline"}
              href={`https://labs.writingmate.ai/?utm_source=app_share&utm_medium=${file_id}`}
            >
              ChatLabs
            </a>
            <IconExternalLink stroke={1.5} size={16} />
          </div>
          <RemixButton fileId={file_id} />
        </div>
      )}
    </div>
  )
}

SharePage.layout = "none"

export default SharePage
