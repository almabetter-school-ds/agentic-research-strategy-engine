import axios from "axios";

export async function tavilySearch(query, options = {}) {
  if (!process.env.TAVILY_API_KEY) throw Object.assign(new Error("Tavily API key is not configured"), { status: 503 });
  const { data } = await axios.post("https://api.tavily.com/search", {
    api_key: process.env.TAVILY_API_KEY,
    query,
    search_depth: "advanced",
    include_answer: false,
    include_raw_content: false,
    max_results: options.maxResults || 8
  }, { timeout: Number(process.env.RESEARCH_TIMEOUT_MS || 45000) });
  return data.results || [];
}
