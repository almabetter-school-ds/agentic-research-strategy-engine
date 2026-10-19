import { generateJson, generateText, shouldUseAiFallback } from "../services/deepseek.service.js";

export async function assistantChat(req, res, next) {
  try {
    const message = String(req.body.message || "").trim();
    if (!message) throw Object.assign(new Error("Message is required"), { status: 400 });
    const response = await generateText(`You are a concise McKinsey market research assistant. Answer using only strategy-oriented guidance and ask for missing context when needed.\n\nUser: ${message}`);
    res.json({ response });
  } catch (err) {
    next(err);
  }
}

export async function assistantAnalyze(req, res, next) {
  try {
    const query = String(req.body.query || "").trim();
    if (query.length < 3) throw Object.assign(new Error("Analysis query is required"), { status: 400 });
    let analysis;
    try {
      analysis = await generateJson(`Create a complete, real, structured market intelligence dashboard analysis for this query: "${query}".

Use current business reasoning and public-market context available to the model. Do not invent exact private data. For numeric chart fields, provide reasoned estimates as numbers so the UI can chart them. Use 0-100 scores for score fields.

Return this JSON shape:
{
  "title": "",
  "executiveSummary":"",
  "summary":"",
  "marketSize":{"tam":"","sam":"","som":""},
  "marketGrowth":[{"year":2025,"value":120}],
  "competitors":[{"name":"","marketShare":0,"revenue":"","employees":"","strengths":[],"weaknesses":[],"movement":""}],
  "trends":[],
  "opportunities": ["", "", ""],
  "risks": ["", "", ""],
  "recommendations": ["", "", ""],
  "swot":{"strengths":[],"weaknesses":[],"opportunities":[],"threats":[]},
  "porterFiveForces":{"competitiveRivalry":0,"supplierPower":0,"buyerPower":0,"threatOfSubstitutes":0,"threatOfNewEntrants":0},
  "pestle":{"political":[],"economic":[],"social":[],"technological":[],"legal":[],"environmental":[]},
  "forecast":[{"year":2025,"value":120}],
  "technologyAdoption":[{"name":"","value":0}],
  "customerSegments":[{"name":"","value":0}],
  "pricingComparison":[{"name":"","price":0}],
  "featureComparison":[{"feature":"","leaders":[],"laggards":[]}],
  "marketSignals":["", "", ""],
  "growthDrivers":["", "", ""],
  "challenges":["", "", ""],
  "goToMarket":["", "", ""],
  "finalConclusion":"",
  "confidence":95,
  "overallScore":89,
  "investmentScore":82,
  "riskScore":25,
  "competitionScore":70,
  "demandScore":92,
  "growthRate":14.2,
  "cagr":18.4,
  "nextResearchQuestions": ["", ""]
}`, null);
    } catch (err) {
      if (!shouldUseAiFallback(err)) throw err;
      analysis = deterministicAnalysis(query, err);
    }
    res.json({ analysis });
  } catch (err) {
    next(err);
  }
}

function deterministicAnalysis(query, err) {
  const title = `${toTitle(query)} Market Intelligence Analysis`;
  const normalized = query.toLowerCase();
  const isGaming = /gaming|game|esport/.test(normalized);
  const isFintech = /bank|fintech|payment|finance/.test(normalized);
  const theme = isGaming ? "gaming" : isFintech ? "digital banking and fintech" : "target";
  const sectors = isGaming
    ? ["Mobile gaming", "Cloud gaming", "Esports", "Creator-led communities"]
    : isFintech
      ? ["Digital wallets", "Embedded finance", "AI risk scoring", "Real-time payments"]
      : ["Enterprise adoption", "Platform consolidation", "AI-enabled workflows", "Data-driven operations"];

  return {
    title,
    executiveSummary: `DeepSeek is currently unavailable, so this fallback analysis uses deterministic market strategy logic for "${query}". The ${theme} market should be assessed through demand intensity, competitive concentration, monetization quality, regulation, and speed of technology adoption before investment or launch decisions.`,
    summary: `Fallback analysis generated because the configured DeepSeek model could not complete the request: ${err?.message || "provider unavailable"}`,
    marketSize: { tam: "Estimate required from verified sources", sam: "Segment after geography and buyer filter", som: "Model from realistic acquisition capacity" },
    marketGrowth: buildSeries(2025, 6, 100, 16),
    competitors: sectors.slice(0, 3).map((name, index) => ({
      name,
      marketShare: [28, 22, 16][index],
      revenue: "Use latest public filings or market datasets",
      employees: "Varies by company mix",
      strengths: ["Distribution", "Brand trust", "Product velocity"].slice(0, 2),
      weaknesses: ["Margin pressure", "Retention risk"],
      movement: "Investing in AI-led personalization and ecosystem partnerships"
    })),
    trends: [
      `AI is improving personalization, forecasting, and operational decision quality in ${theme}.`,
      "User acquisition costs are pushing companies toward retention, subscriptions, and higher lifetime value.",
      "Platform partnerships and data integrations are becoming strategic differentiators."
    ],
    opportunities: sectors.map(item => `Build focused offerings around ${item.toLowerCase()} with measurable unit economics.`),
    risks: ["Quota/provider dependency for AI features", "Competitive price pressure", "Regulatory and data privacy exposure"],
    recommendations: ["Validate demand with a narrow segment first", "Benchmark competitors with current source-backed data", "Track margin, retention, and CAC payback as primary KPIs"],
    swot: {
      strengths: ["Strong AI-assisted research workflow", "Fast scenario generation"],
      weaknesses: ["Live market data still needs source validation", "Provider quota dependency"],
      opportunities: sectors.slice(0, 3),
      threats: ["Fast-moving incumbents", "Model/API availability changes", "Customer acquisition inflation"]
    },
    porterFiveForces: { competitiveRivalry: 78, supplierPower: 55, buyerPower: 70, threatOfSubstitutes: 62, threatOfNewEntrants: 58 },
    pestle: {
      political: ["Policy scrutiny around data and consumer protection"],
      economic: ["Higher capital discipline and profitability focus"],
      social: ["Demand for convenient, personalized digital experiences"],
      technological: ["AI automation and real-time analytics adoption"],
      legal: ["Privacy, licensing, and compliance requirements"],
      environmental: ["Cloud efficiency and sustainable operations expectations"]
    },
    forecast: buildSeries(2025, 5, 120, 18),
    technologyAdoption: sectors.map((name, index) => ({ name, value: [82, 74, 68, 59][index] || 55 })),
    customerSegments: ["Enterprise", "SMB", "Consumer", "Developers"].map((name, index) => ({ name, value: [38, 27, 24, 11][index] })),
    pricingComparison: sectors.slice(0, 4).map((name, index) => ({ name, price: [49, 79, 129, 199][index] })),
    featureComparison: [
      { feature: "AI personalization", leaders: sectors.slice(0, 2), laggards: sectors.slice(2, 4) },
      { feature: "Ecosystem integrations", leaders: sectors.slice(1, 3), laggards: sectors.slice(0, 1) }
    ],
    marketSignals: ["Search demand and funding activity", "Partnership announcements", "Pricing and retention changes"],
    growthDrivers: ["AI-enabled automation", "Digital-first customer behavior", "Platform ecosystem expansion"],
    challenges: ["Data quality", "Trust and compliance", "Differentiation against scaled platforms"],
    goToMarket: ["Start with a high-intent niche", "Use expert-led content and partnerships", "Convert research insights into repeatable workflows"],
    finalConclusion: `Proceed with source-backed validation before major spend. The opportunity looks strongest where ${theme} demand is urgent, measurable, and underserved by current competitors.`,
    confidence: 68,
    overallScore: 74,
    investmentScore: 72,
    riskScore: 42,
    competitionScore: 76,
    demandScore: 80,
    growthRate: 14.2,
    cagr: 16.8,
    nextResearchQuestions: ["Which subsegment has the strongest willingness to pay?", "Which competitors are gaining share fastest?"],
    fallback: true
  };
}

function buildSeries(startYear, count, startValue, growthRate) {
  return Array.from({ length: count }, (_, index) => ({
    year: startYear + index,
    value: Math.round(startValue * ((1 + growthRate / 100) ** index))
  }));
}

function toTitle(value) {
  return String(value)
    .replace(/[^\w\s&-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
