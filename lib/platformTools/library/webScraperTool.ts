import {
  GetYoutubeCaptionsResult,
  GoogleSearchResult,
  PlatformTool
} from "@/types/platformTools"
import html2md from "html-to-md"
import { getSubtitles } from "@/lib/youtube"

// This is a helper function that fetches data from a URL and returns it.
const fetchAndReturn = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome"
    }
  })

  return response.text()
}

// This function fetches data from a URL and returns it in markdown format.
const webScraper = async (
  params:
    | {
        parameters: { url: string }
      }
    | { url: string }
) => {
  if ("parameters" in params) {
    params = params.parameters
  }

  const url = params.url

  if (url === undefined) {
    throw new Error("URL is required")
  }

  if (typeof url !== "string") {
    throw new Error("URL must be a string")
  }

  let modifiedUrl = url
  let mdDoc = ""
  try {
    if (!url.startsWith("http")) {
      modifiedUrl = "http://" + url
      try {
        const scrape = await fetchAndReturn(modifiedUrl)
        mdDoc = html2md(scrape)
      } catch (error) {
        modifiedUrl = "https://" + url
        const scrape = await fetchAndReturn(modifiedUrl)
        mdDoc = html2md(scrape)
      }
    } else {
      const scrape = await fetchAndReturn(modifiedUrl)
      mdDoc = html2md(scrape)
    }
  } catch (error: any) {
    mdDoc = "Failed to fetch the URL: " + error.message
  }

  // Fix for relative URLs
  const urlRegex = /href="((?:\.\.\/)*(?:\.\/)*)\/?(?!\/)/g
  mdDoc = mdDoc.replace(
    urlRegex,
    (match, p1) => `href="${new URL(p1, modifiedUrl).href}`
  )

  return { url, mdDoc }
}

function mergeSubtitleChunks(chunks: any[], n: number) {
  if (chunks.length === 0) {
    return []
  }

  let mergedChunks = []

  for (let i = 0; i < chunks.length; i += n) {
    const chunkGroup = chunks.slice(i, i + n)
    const mergedChunk = {
      start: parseInt(chunkGroup[0].start),
      text: chunkGroup.map(chunk => chunk.text).join(" "),
      dur: chunkGroup
        .map(x => x.dur)
        .reduce((a, b) => parseFloat(a) + parseFloat(b))
    }

    mergedChunks.push(mergedChunk)
  }

  return mergedChunks
}

async function getYoutubeCaptions(
  params: any
): Promise<Omit<GetYoutubeCaptionsResult, "responseTime">> {
  let videoId = params.videoId || params.parameters?.videoId || ""

  if (!videoId) {
    throw new Error("videoId is required")
  }

  if (videoId.startsWith("https://www.youtube.com/watch?v=")) {
    videoId = videoId.split("https://www.youtube.com/watch?v=")[1]
  }

  if (videoId.startsWith("https://youtu.be/")) {
    videoId = videoId.split("https://youtu.be/")[1]
  }

  if (videoId.startsWith("https://youtube.com/watch?v=")) {
    videoId = videoId.split("https://youtube.com/watch?v=")[1]
  }

  if (typeof videoId !== "string") {
    throw new Error("videoId must be a string")
  }

  const result = (
    await getSubtitles({
      videoID: videoId,
      lang: "en"
    })
  ).flatMap(x => (!!x ? [x] : []))

  const optimizedResult = mergeSubtitleChunks(result, 6)

  return {
    subtitles: optimizedResult,
    imageUrl: "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=" + videoId
  }
}

async function googleSearch(
  params:
    | {
        parameters: { query: string }
      }
    | { query: string }
): Promise<Partial<GoogleSearchResult>> {
  if ("parameters" in params) {
    params = params.parameters
  }
  const query = params.query

  if (query === undefined) {
    throw new Error("Query is required")
  }

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY as string,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ q: query })
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const result = await response.json()

  return {
    organic: result.organic.slice(0, 3)
  }
}

// This is the definition of the webscrapping tool.
export const webScraperTool: PlatformTool = {
  id: "b3f07a6e-5e01-423e-9f06-ee51830608be", // This is the unique identifier of the tool.
  name: "Web Browsing", // This is the name of the tool.
  toolName: "webScraper", // This is the name of the tool in the code.
  version: "v1.0.0", // This is the version of the tool.
  // This is the description of the tool.
  description: `This tool uses two functions, 
  one to search google when a search query is provided, 
  and another to fetch data from a URL.`,
  toolsFunctions: [
    {
      id: "FetchDataFromUrl", // This is the unique identifier of the tool function.
      toolFunction: webScraper, // This is the function that will be called when the tool function is executed.
      description:
        "Fetch data from a URL and return it in markdown format. Only use it with results from googleSearch function or when user specifies url to scrape", // This is the description of the tool function.
      parameters: [
        // These are the parameters of the tool function.
        {
          name: "url",
          description: "The url to fetch data from.",
          required: true,
          schema: {
            type: "string"
          }
        }
      ]
    },
    {
      id: "googleSearch",
      toolFunction: googleSearch,
      description: `Search google for a query and return the results.
Always add references for google search results at the end of each sentence like this:
<sentence1>[1](<link1>).
<sentence2>[2](<link2>).

Each unique link has unique reference number.
      `,
      parameters: [
        {
          name: "query",
          description: "The query to search for.",
          required: true,
          schema: {
            type: "string"
          }
        }
      ]
    },
    {
      id: "youtubeCaptions",
      toolFunction: getYoutubeCaptions,
      description: `Get YouTube captions using video id. Video id is id from the URL. Returns subtitles and image url. https://www.youtube.com/watch?v=VIDEO_ID
Always break down youtube captions in to three sentence paragraphs and add links to time codes like this:
<paragraph1>[1](https://youtube.com/watch?v=VIDEO_ID&t=START1s).
<paragraph2>[2](https://youtube.com/watch?v=VIDEO_ID&t=START2s).
<paragraph3>[3](https://youtube.com/watch?v=VIDEO_ID&t=START3s).`,
      parameters: [
        {
          name: "videoId",
          description:
            "Video id is id from the youtube URL. https://www.youtube.com/watch?v=VIDEO_ID",
          required: true,
          schema: {
            type: "string"
          }
        }
      ]
    }
  ]
}
