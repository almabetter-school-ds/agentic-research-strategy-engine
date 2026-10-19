import axios from "axios";

export async function scrapeUrl(url) {
  if (!process.env.FIRECRAWL_API_KEY) return null;
  const { data } = await axios.post("https://api.firecrawl.dev/v1/scrape", {
    url,
    formats: ["markdown", "html"],
    onlyMainContent: true
  }, {
    headers: { Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}` },
    timeout: Number(process.env.RESEARCH_TIMEOUT_MS || 45000)
  });
  return data?.data || null;
}
