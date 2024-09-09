import { PlatformTool, SearchResult } from "@/types/platformTools"
import { url } from "inspector"

// Update the SearchResult type
interface ExtendedSearchResult {
  title: string
  url: string
  snippet: string
  image: string | null
  content?: string
  published_date?: string
  report?: string // Add this line
}

// This function performs a web search using Tavily's API and returns the search results.
const tavilySearch = async (
  params: { parameters: { query: string } } | { query: string }
): Promise<
  Omit<SearchResult, "responseTime"> & {
    report: string
    results: any[]
    numResults: number
    snippet: string
  }
> => {
  if ("parameters" in params) {
    params = params.parameters
  }

  const { query } = params

  if (!query) {
    throw new Error("Query is required")
  }

  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    throw new Error("Tavily API key is required")
  }

  const apiUrl = "https://api.tavily.com/search"
  let numResults = 8
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: encodeURIComponent(query), // Encode the query
        include_images: true
      })
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.statusText}`)
    }

    const data = await response.json()

    let searchResults = data.results.map((result: any) => ({
      title: result.title,
      url: result.url,
      image: null,
      snippet: result.snippet,
      content: result.content
    }))

    const searchImages = data.images || []

    searchResults = searchResults.map((result: any, index: number) => {
      return {
        ...result,
        image: searchImages[index] || null
      }
    })

    console.log("Combined search results with images:", searchResults)

    const report = await generateReport(searchResults, query)

    return {
      results: searchResults,
      numResults: data.numResults || searchResults.length,
      report: report,
      score: 1, // Add a default score
      title: query, // Use the query as the title
      id: Date.now().toString(), // Generate a unique ID
      url: "", // Add an empty URL or generate one if available
      snippet: "", // Now this is valid
      publishedDate: "", // Add this line
      author: "" // Add this line
    }
  } catch (error: any) {
    console.error("Failed to perform web search", error, numResults)
    throw new Error(`Failed to perform web search: ${error.message}`)
  }
}

async function generateReport(
  searchResults: any[],
  query: string
): Promise<string> {
  let report = `# ${generateReportTitle(query)}\n\n`

  report += generateIntroduction(query)

  for (const result of searchResults) {
    report += `## ${result.title}\n\n`
    report += `${result.snippet}\n\n`
    if (result.content) {
      report += `Key points:\n`
      report += `${summarizeContent(result.content)}\n\n`
    }
    report += `[Read more](${result.url})\n\n`
  }

  return report
}

function generateReportTitle(query: string): string {
  // Generate a title based on the query
  return `AI Report: ${query}`
}

function generateIntroduction(query: string): string {
  // Generate an introduction based on the query
  return `This report provides an overview of recent developments related to "${query}". It synthesizes information from multiple sources to present key insights and trends on the topic.\n\n`
}

function summarizeContent(content: string): string {
  // Implement a summarization algorithm here
  // Be sure to paraphrase and not copy directly
  // Return a brief, original summary
  return "Summary placeholder" // Replace with actual summarization logic
}

class PlannerAgent {
  async generateResearchQuestions(topic: string): Promise<string[]> {
    // Use GPT to generate research questions
    // For simplicity, we'll use a predefined list
    return [
      `What are the latest developments in ${topic}?`,
      `What are the main challenges in ${topic}?`,
      `What are the future prospects of ${topic}?`
    ]
  }

  async aggregateResults(
    results: ExtendedSearchResult[],
    topic: string
  ): Promise<string> {
    let report = `# Comprehensive Report on ${topic}\n\n`
    results.forEach((result, index) => {
      report += `## Research Question ${index + 1}\n\n`
      report += result.report || result.snippet + "\n\n" // Use report if available, otherwise fallback to snippet
    })
    return report
  }
}

async function conductResearch(topic: string): Promise<string> {
  const isTimeSensitive =
    /news|financial|forecast|election|stock|market|current|latest/i.test(topic)
  const timeFrame = isTimeSensitive ? "past week" : ""
  const searchResult = await tavilySearch({
    query: `${topic} ${timeFrame}`.trim()
  })

  let report = `# Research Report: ${topic}\n\n`
  let references: string[] = []

  searchResult.results.forEach((result: ExtendedSearchResult, index) => {
    report += `## ${index + 1}. ${result.title}\n\n`
    report += `${result.snippet}\n\n`
    if (result.published_date) {
      report += `Published: ${result.published_date}\n\n`
    }
    if (result.image) {
      report += `![Related Image](${result.image})\n\n`
    }
    references.push(`${index + 1}. ${result.title}: ${result.url}`)
  })

  report += `## Summary\n\n${generateSummary(searchResult.results)}\n\n`

  report += `## References\n\n${references.join("\n")}\n\n`

  report += `Note: This report includes the most recent information available as of the search time. `
  report += `For rapidly changing topics, please verify the latest updates from authoritative sources.`

  return report
}

function generateSummary(results: ExtendedSearchResult[]): string {
  // Implement AI-generated summary logic here
  return "AI-generated summary of key points and trends based on the search results."
}

// This is the definition of the web search tool.
export const webSearchTool: PlatformTool = {
  id: "d3f08b6e-7e02-423f-9g07-ee51830809fe", // This is the unique identifier of the tool.
  name: "Web Search", // This is the name of the tool.
  toolName: "tavilySearch", // This is the name of the tool in the code.
  version: "v1.0.0", // This is the version of the tool.
  // This is the description of the tool.
  description: "Search the web using Tavily's API and return relevant results.",
  toolsFunctions: [
    {
      id: "search", // This is the unique identifier of the tool function.
      toolFunction: tavilySearch, // This is the function that will be called when the tool function is executed.
      description: `Perform a web search using Tavily's API.
      Returns search results including most updated articles.
      including images and content.
      Display all the returned content below the title.
      Use the user's own language for searching instead of English.
      Return the response in the same language as the user's input.
      Generate a summary report as a conclusion using all the returned content.
      Do not use semi-colons when describing images. Use HTML.
      You should only return the function call in tools call sections.
        `, // This is the description of the tool function.
      parameters: [
        // These are the parameters of the tool function.
        {
          name: "query",
          description: "The query to search for.",
          required: true,
          schema: {
            type: "string"
          }
        }
      ]
    }
  ]
}
