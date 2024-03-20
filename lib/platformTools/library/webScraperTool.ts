import { PlatformTool } from "@/types/platformTools"
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
const webScraper = async ({
  parameters: { url }
}: {
  parameters: { url: string }
}) => {
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

async function getYoutubeCaptions(params: any) {
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

  const result = await getSubtitles({
    videoID: videoId,
    lang: "en"
  })

  return {
    subitles: result,
    imageUrl: "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg"
  }
}

// printf '{"q":"apple inc"}'| http  --follow --timeout 3600 POST 'https://google.serper.dev/search' \
//  X-API-KEY:'ed8b5dff55f338bb672b086aa0e96b84a84f301f' \
//  Content-Type:'application/json'
async function googleSearch({
  parameters: { query }
}: {
  parameters: { query: string }
}) {
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ q: query })
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const result = await response.json()

  return result
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
  and another to fetch data from a URL. 
  When performing a search, it should always scrape the provided urls and return the results in markdown format. 
  When performing Google Search, always add the results into the response, including links. 
  For youtube links use youtubeCaptions function. Also always include markdown image in the response in the format https://img.youtube.com/vi/{videoId}/hqdefault.jpg.`,
  toolsFunctions: [
    {
      id: "FetchDataFromUrl", // This is the unique identifier of the tool function.
      toolFunction: webScraper, // This is the function that will be called when the tool function is executed.
      description: "Fetch data from a URL and return it in markdown format.", // This is the description of the tool function.
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
      description: "Search google for a query and return the results.",
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
      description:
        "Get YouTube captions using video id. Video id is id from the URL. Returns subtitles and image url. https://www.youtube.com/watch?v=VIDEO_ID",
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
