// @ts-ignore
import he from "he"
import { find } from "lodash"
import striptags from "striptags"

const fetchData = async function (url: string) {
  const response = await fetch(url)
  return await response.text()
}

export async function getSubtitles({
  videoID,
  lang = "en"
}: {
  videoID: string
  lang: "en" | "de" | "fr" | void
}) {
  const data = await fetchData(`https://www.youtube.com/watch?v=${videoID}`)

  // * ensure we have access to captions data
  if (!data.includes("captionTracks"))
    throw new Error(`Could not find captions for video: ${videoID}`)

  const regex = /"captionTracks":(\[.*?\])/
  const match = regex.exec(data)

  if (!match) throw new Error(`Could not find captions for video: ${videoID}`)

  const { captionTracks } = JSON.parse(`{${match[0]}}`)
  const subtitle =
    find(captionTracks, {
      vssId: `.${lang}`
    }) ||
    find(captionTracks, {
      vssId: `a.${lang}`
    }) ||
    find(captionTracks, ({ vssId }) => vssId && vssId.match(`.${lang}`))

  // * ensure we have found the correct subtitle lang
  if (!subtitle || (subtitle && !subtitle.baseUrl))
    throw new Error(`Could not find ${lang} captions for ${videoID}`)

  const transcript = await fetchData(subtitle.baseUrl)
  const lines = transcript
    .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', "")
    .replace("</transcript>", "")
    .split("</text>")
    .filter(line => line && line.trim())
    .map(line => {
      const startRegex = /start="([\d.]+)"/
      const durRegex = /dur="([\d.]+)"/

      const startMatch = startRegex.exec(line)
      const durMatch = durRegex.exec(line)

      if (!startMatch || !durMatch) return null

      const htmlText = line
        .replace(/<text.+>/, "")
        .replace(/&amp;/gi, "&")
        .replace(/<\/?[^>]+(>|$)/g, "")

      const decodedText = he.decode(htmlText)
      const text = striptags(decodedText)

      return {
        start: startMatch[1],
        dur: durMatch[1],
        text
      }
    })

  console.log(lines)

  return lines
}
