import { BaseTool } from "../common/BaseTool"
import { ToolFunction } from "@/types/platformTools"
import {
  GetYoutubeCaptionsResult,
  GoogleSearchResult,
  PlatformTool
} from "@/types/platformTools"
import html2md from "html-to-md"
import { getSubtitles } from "@/lib/youtube"
import { logger } from "@/lib/logger"

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
  logger.debug("Starting webScraper function")

  if ("parameters" in params) {
    params = params.parameters
  }

  const url = params.url

  logger.debug({ url }, "Received URL")

  if (url === undefined) {
    logger.error("URL is missing")
    throw new Error("URL is required")
  }

  if (typeof url !== "string") {
    logger.error({ urlType: typeof url }, "Invalid URL type")
    throw new Error("URL must be a string")
  }

  let modifiedUrl = url
  let mdDoc = ""
  try {
    if (!url.startsWith("http")) {
      modifiedUrl = "http://" + url
      try {
        logger.debug({ modifiedUrl }, "Fetching content")
        const scrape = await fetchAndReturn(modifiedUrl)
        mdDoc = html2md(scrape)
        logger.debug("Content fetched and converted to markdown")
      } catch (error) {
        modifiedUrl = "https://" + url
        logger.debug({ modifiedUrl }, "Fetching content")
        const scrape = await fetchAndReturn(modifiedUrl)
        mdDoc = html2md(scrape)
        logger.debug("Content fetched and converted to markdown")
      }
    } else {
      logger.debug({ modifiedUrl }, "Fetching content")
      const scrape = await fetchAndReturn(modifiedUrl)
      mdDoc = html2md(scrape)
      logger.debug("Content fetched and converted to markdown")
    }
  } catch (error: any) {
    logger.error({ error: error.message }, "Failed to fetch the URL")
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
  logger.debug("Starting getYoutubeCaptions function")

  let videoId = params.videoId || params.parameters?.videoId || ""

  logger.debug({ videoId }, "Received video ID")

  if (!videoId) {
    logger.error("videoId is missing")
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
    logger.error({ videoIdType: typeof videoId }, "Invalid video ID type")
    throw new Error("videoId must be a string")
  }

  logger.debug("Fetching subtitles")
  const result = (
    await getSubtitles({
      videoID: videoId,
      lang: "en"
    })
  ).flatMap(x => (!!x ? [x] : []))

  logger.debug("Optimizing subtitles")
  const optimizedResult = mergeSubtitleChunks(result, 6)

  logger.debug("Returning caption results")
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
  logger.debug("Starting googleSearch function")

  if ("parameters" in params) {
    params = params.parameters
  }
  const query = params.query

  logger.debug({ query }, "Received search query")

  if (query === undefined) {
    logger.error("Query is missing")
    throw new Error("Query is required")
  }

  logger.debug("Sending request to Google Search API")
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY as string,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ q: query })
  })

  if (!response.ok) {
    logger.error(
      { status: response.status, statusText: response.statusText },
      "Google Search API request failed"
    )
    throw new Error(response.statusText)
  }

  const result = await response.json()
  logger.debug("Google Search results received")

  return {
    organic: result.organic.slice(0, 5)
  }
}

class WebScraperTool extends BaseTool {
  constructor() {
    super(
      "Web Browsing",
      "b3f07a6e-5e01-423e-9f06-ee51830608be",
      "webScraper",
      `This tool uses multiple functions, including searching Google, fetching data from a URL, and getting YouTube captions.`
    )
  }

  protected getToolFunctions(): ToolFunction[] {
    return [
      {
        id: "FetchDataFromUrl",
        toolFunction: webScraper,
        description:
          "Fetch data from a URL and return it in markdown format. Only use it with results from googleSearch function or when user specifies url to scrape",
        parameters: [
          {
            name: "url",
            description: "The url to fetch data from.",
            required: true,
            schema: { type: "string" }
          }
        ],
        responseSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The url that was fetched."
            },
            mdDoc: {
              type: "string",
              description:
                "The markdown document fetched from the url. Render it in markdown format."
            }
          }
        }
      },
      {
        id: "googleSearch",
        toolFunction: googleSearch,
        description: `Search google for a query and return the results.
Always add references for google search results at the end of each sentence like this:
<sentence1>[1](<link1>).
<sentence2>[2](<link2>).
<sentence3>[3](<link3>).
<sentence4>[4](<link4>).
<sentence5>[5](<link5>).
<sentence6>[6](<link6>).
<sentence7>[7](<link7>).
<sentence8>[8](<link8>).
<sentence9>[9](<link9>).
<sentence10>[10](<link10>).

Each unique link has unique reference number.
Return up to 10 relevant results.
            `,
        parameters: [
          {
            name: "query",
            description: "The query to search for.",
            required: true,
            schema: { type: "string" }
          }
        ],
        responseSchema: {
          type: "object",
          properties: {
            organic: {
              type: "array",
              description: "The organic search results.",
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "The title of the search result."
                  },
                  link: {
                    type: "string",
                    description: "The link to the search result."
                  }
                }
              }
            }
          }
        }
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
            schema: { type: "string" }
          }
        ],
        responseSchema: {
          type: "object",
          properties: {
            subtitles: {
              type: "array",
              description: "The subtitles of the youtube video.",
              items: {
                type: "object",
                properties: {
                  start: {
                    type: "number",
                    description: "The start time of the subtitle."
                  },
                  text: {
                    type: "string",
                    description: "The text of the subtitle."
                  },
                  dur: {
                    type: "number",
                    description: "The duration of the subtitle."
                  }
                }
              }
            },
            imageUrl: {
              type: "string",
              description: "The image url of the youtube video."
            },
            videoUrl: {
              type: "string",
              description: "The video url of the youtube video."
            }
          }
        }
      }
    ]
  }
}

export const webScraperTool = new WebScraperTool().createPlatformTool()
