import { chromium } from "playwright";

export async function fetchReadablePage(url) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ userAgent: "MarketResearchEngine/1.0" });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: Number(process.env.RESEARCH_TIMEOUT_MS || 45000) });
    const title = await page.title();
    const content = await page.locator("body").innerText({ timeout: 10000 });
    return { title, content: content.slice(0, 50000) };
  } finally {
    await browser?.close();
  }
}
