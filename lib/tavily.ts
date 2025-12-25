import { tavily } from "@tavily/core";

/**
 * Tavily Web Search Helper
 * Searches the web for automotive repair information using official SDK
 */

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content: string | null;
  favicon?: string;
}

export interface TavilyResponse {
  query: string;
  answer: string;
  images: string[];
  results: TavilySearchResult[];
  response_time: string;
}

export async function searchWeb(query: string): Promise<TavilyResponse | null> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    console.warn("TAVILY_API_KEY not found in environment");
    return null;
  }

  try {
    const tvly = tavily({ apiKey });
    const response = await tvly.search(query, {
      searchDepth: "basic",
      maxResults: 3,
      includeAnswer: true,
    });

    return response as any; // SDK types may differ slightly from our interface
  } catch (error: unknown) {
    console.error("Tavily search error:", error);
    return null;
  }
}
