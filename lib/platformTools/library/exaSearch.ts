import {
  PlatformTool,
  SearchResult,
  ExaSearchResponse
} from "@/types/platformTools"
import fetch from "node-fetch"

const EXA_API_KEY = process.env.EXA_API_KEY || ""

// Remove these duplicate interface definitions
// interface SearchResult { ... }
// interface ExaSearchResponse { ... }

async function exaSearch(
  query: string,
  numResults: number = 10
): Promise<ExaSearchResponse> {
  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": EXA_API_KEY
    },
    body: JSON.stringify({
      query,
      useAutoprompt: false,
      numResults,
      type: "neural",
      excludeDomains: ["www.linkedin.com"],
      startCrawlDate: "2015-03-01T00:00:00",
      endCrawlDate: new Date().toISOString(),
      categories: ["news", "articles", "reports"]
    })
  })

  if (!response.ok) {
    throw new Error(`Exa API request failed: ${response.statusText}`)
  }

  return (await response.json()) as ExaSearchResponse
}

async function generateSearchQueries(
  topic: string,
  n: number
): Promise<string[]> {
  // Placeholder implementation
  return [
    `${topic} overview`,
    `${topic} latest developments`,
    `${topic} impact on industry`
  ]
}

async function synthesizeReport(
  topic: string,
  searchResults: SearchResult[]
): Promise<string> {
  // Placeholder implementation
  const summary = searchResults
    .map(result => `- ${result.title} (${result.url})`)
    .join("\n")
  return `Research Report on ${topic}:\n\n${summary}`
}

async function researcherTools(
  params: { parameters: { topic: string } } | { topic: string }
): Promise<string> {
  const topic = "parameters" in params ? params.parameters.topic : params.topic
  const searchQueries = await generateSearchQueries(topic, 3)
  let allResults: SearchResult[] = []

  for (const query of searchQueries) {
    const searchResponse = await exaSearch(query)
    allResults = allResults.concat(searchResponse.results)
  }

  // Deduplicate results based on URL
  const uniqueResults = Array.from(
    new Map(allResults.map(item => [item.url, item])).values()
  )
  return await synthesizeReport(topic, uniqueResults)
}

export const exaResearcherTool: PlatformTool = {
  id: "d3f08b6e-7e02-423f-9g07-ee51830809fe", // This is the unique identifier of the tool.
  name: "Exa Research Assistant",
  toolName: "exaResearcher",
  version: "v1.0.0",
  description:
    "This tool conducts research on a given topic using the Exa search API, generating search queries and synthesizing a report.",
  toolsFunctions: [
    {
      id: "research",
      toolFunction: researcherTools,
      description:
        "Conduct comprehensive research on a specified topic using the Exa search API. This function generates multiple search queries, retrieves relevant results, deduplicates them, and synthesizes a detailed report. The report includes an overview, latest developments, and industry impact of the given topic, with direct links to sources.",
      parameters: [
        {
          name: "topic",
          description: "The topic to research.",
          required: true,
          schema: {
            type: "string"
          }
        }
      ]
    }
  ]
}
