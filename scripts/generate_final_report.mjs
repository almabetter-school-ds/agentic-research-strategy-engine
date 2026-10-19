import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const requireFromFrontend = createRequire(path.join(root, "frontend", "package.json"));
const requireFromBackend = createRequire(path.join(root, "backend", "package.json"));
const sharp = requireFromFrontend("sharp");
const { chromium } = requireFromBackend("playwright");

const dirs = {
  charts: path.join(root, "charts"),
  reports: path.join(root, "reports"),
  pdf: path.join(root, "output", "pdf"),
  html: path.join(root, "output", "html"),
};

for (const dir of Object.values(dirs)) fs.mkdirSync(dir, { recursive: true });

const reportDate = "August 7, 2026";
const title = "AI Market Strategy Engine";
const subtitle = "Executive Market Intelligence, Competitive Strategy, and Growth Roadmap";
const company = "AI Market Strategy Engine Project";

const sources = {
  readme: "../README.md",
  architecture: "../docs/ARCHITECTURE.md",
  api: "../docs/API.md",
  testing: "../docs/TESTING.md",
  assistant: "../backend/src/controllers/assistant.controller.js",
  dashboard: "../backend/src/controllers/dashboard.controller.js",
  gartner: "https://www.gartner.com/en/newsroom/press-releases/2026-05-19-gartner-forecasts-worldwide-ai-spending-to-grow-47-percent-in-2026",
  stanford: "https://hai.stanford.edu/ai-index/2026-ai-index-report",
  mckinsey: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai",
  ibm: "https://www.ibm.com/reports/data-breach",
  ibmNews: "https://newsroom.ibm.com/2025-07-30-ibm-report-13-of-organizations-reported-breaches-of-ai-models-or-applications%2C-97-of-which-reported-lacking-proper-ai-access-controls",
};

const data = {
  kpis: [
    ["AI spending growth, 2026", "47%", "Gartner forecast for worldwide AI spending growth"],
    ["Worldwide AI spend, 2026", "$2.59T", "Gartner forecast; vendor and hyperscaler dominated"],
    ["Organizations using AI", "88%", "McKinsey 2025 survey, regular use in at least one function"],
    ["Agentic AI activity", "62%", "McKinsey respondents experimenting with or scaling AI agents"],
    ["Enterprise EBIT impact", "39%", "McKinsey respondents reporting EBIT impact at enterprise level"],
    ["U.S. private AI investment", "$285.9B", "Stanford AI Index 2026, 2025 investment"],
    ["Average breach cost", "$4.44M", "IBM Cost of a Data Breach Report 2025"],
    ["AI governance gap", "63%", "IBM: breached organizations without or still developing AI governance"],
  ],
  spending: [
    { market: "AI Infrastructure", 2025: 975581, 2026: 1431509, 2027: 1890310 },
    { market: "AI Services", 2025: 436351, 2026: 585527, 2027: 759418 },
    { market: "AI Software", 2025: 282897, 2026: 453209, 2027: 638431 },
    { market: "AI Cybersecurity", 2025: 25920, 2026: 51347, 2027: 85997 },
    { market: "AI Models", 2025: 15494, 2026: 32604, 2027: 59161 },
  ],
  adoption: [
    { metric: "AI use", value: 88 },
    { metric: "Innovation enabled", value: 64 },
    { metric: "Agent activity", value: 62 },
    { metric: "Enterprise EBIT impact", value: 39 },
    { metric: "Enterprise scaling", value: 33 },
  ],
  investment: [
    { region: "United States", value: 285.9 },
    { region: "China", value: 12.4 },
  ],
  competitors: [
    { name: "AI Market Strategy Engine", workflow: 92, evidence: 88, automation: 90, governance: 86, memory: 84 },
    { name: "AlphaSense", workflow: 78, evidence: 84, automation: 62, governance: 72, memory: 70 },
    { name: "CB Insights", workflow: 74, evidence: 80, automation: 58, governance: 70, memory: 68 },
    { name: "Gartner", workflow: 68, evidence: 82, automation: 42, governance: 78, memory: 62 },
    { name: "Similarweb", workflow: 62, evidence: 74, automation: 52, governance: 66, memory: 58 },
    { name: "Perplexity Enterprise", workflow: 70, evidence: 66, automation: 76, governance: 60, memory: 64 },
  ],
  customerSegments: [
    { name: "Strategy Consulting", value: 34 },
    { name: "Corporate Strategy", value: 27 },
    { name: "Product Marketing", value: 20 },
    { name: "Private Equity", value: 12 },
    { name: "Innovation Teams", value: 7 },
  ],
  opportunities: [
    { opportunity: "Governed agentic research", attractiveness: 88, feasibility: 78 },
    { opportunity: "Evidence-backed board reporting", attractiveness: 82, feasibility: 74 },
    { opportunity: "Competitive intelligence memory", attractiveness: 79, feasibility: 81 },
    { opportunity: "Vertical playbooks", attractiveness: 76, feasibility: 70 },
    { opportunity: "Data partnership marketplace", attractiveness: 68, feasibility: 58 },
  ],
  risks: [
    { risk: "AI provider quota or model availability", likelihood: 4, impact: 4 },
    { risk: "Unverified or stale source data", likelihood: 3, impact: 5 },
    { risk: "Privacy and governance failure", likelihood: 3, impact: 5 },
    { risk: "Incumbent bundling pressure", likelihood: 4, impact: 3 },
    { risk: "Low enterprise workflow adoption", likelihood: 3, impact: 4 },
  ],
  swotCounts: [
    { area: "Strengths", value: 4 },
    { area: "Weaknesses", value: 3 },
    { area: "Opportunities", value: 5 },
    { area: "Threats", value: 4 },
  ],
};

const chartFiles = {};

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapLabel(value, max = 16) {
  const words = String(value).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + " " + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

async function saveChart(name, svg) {
  const svgPath = path.join(dirs.charts, `${name}.svg`);
  const pngPath = path.join(dirs.charts, `${name}.png`);
  fs.writeFileSync(svgPath, svg, "utf8");
  await sharp(Buffer.from(svg)).png().toFile(pngPath);
  chartFiles[name] = `../charts/${name}.png`;
}

function svgShell(titleText, subtitleText, body, width = 1100, height = 620) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#f8fafc"/>
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="18" fill="#ffffff" stroke="#dbe4ef"/>
  <text x="56" y="72" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#0f2f57">${esc(titleText)}</text>
  <text x="56" y="102" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#64748b">${esc(subtitleText)}</text>
  ${body}
</svg>`;
}

function barChart({ titleText, subtitleText, rows, labelKey, valueKey, unit = "", color = "#2563eb", maxValue }) {
  const width = 1100;
  const height = 620;
  const x = 230;
  const y = 140;
  const chartW = 780;
  const barH = 42;
  const gap = 28;
  const max = maxValue || Math.max(...rows.map((r) => r[valueKey]));
  let body = `<line x1="${x}" y1="${y - 20}" x2="${x}" y2="${y + rows.length * (barH + gap)}" stroke="#cbd5e1"/>
  <line x1="${x}" y1="${y + rows.length * (barH + gap)}" x2="${x + chartW}" y2="${y + rows.length * (barH + gap)}" stroke="#cbd5e1"/>`;
  rows.forEach((row, i) => {
    const yy = y + i * (barH + gap);
    const w = (row[valueKey] / max) * chartW;
    body += `<text x="56" y="${yy + 27}" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#334155">${esc(row[labelKey])}</text>
    <rect x="${x}" y="${yy}" width="${w}" height="${barH}" rx="8" fill="${color}"/>
    <text x="${Math.min(x + w + 12, x + chartW - 90)}" y="${yy + 27}" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#0f172a">${row[valueKey]}${unit}</text>`;
  });
  return svgShell(titleText, subtitleText, body, width, height);
}

function groupedBarChart() {
  const width = 1100;
  const height = 620;
  const x0 = 90;
  const y0 = 500;
  const chartW = 940;
  const chartH = 340;
  const groups = data.spending;
  const max = Math.max(...groups.flatMap((r) => [r[2025], r[2026], r[2027]]));
  const colors = { 2025: "#93c5fd", 2026: "#2563eb", 2027: "#0f2f57" };
  let body = `<line x1="${x0}" y1="${y0 - chartH}" x2="${x0}" y2="${y0}" stroke="#cbd5e1"/>
  <line x1="${x0}" y1="${y0}" x2="${x0 + chartW}" y2="${y0}" stroke="#cbd5e1"/>`;
  [0, 0.25, 0.5, 0.75, 1].forEach((tick) => {
    const y = y0 - chartH * tick;
    const label = Math.round((max * tick) / 1000).toLocaleString();
    body += `<line x1="${x0}" y1="${y}" x2="${x0 + chartW}" y2="${y}" stroke="#e2e8f0"/>
    <text x="${x0 - 14}" y="${y + 5}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#64748b">${label}B</text>`;
  });
  const groupW = chartW / groups.length;
  groups.forEach((row, gi) => {
    const baseX = x0 + gi * groupW + 32;
    [2025, 2026, 2027].forEach((year, yi) => {
      const h = (row[year] / max) * chartH;
      body += `<rect x="${baseX + yi * 32}" y="${y0 - h}" width="24" height="${h}" rx="5" fill="${colors[year]}"/>`;
    });
    wrapLabel(row.market, 14).forEach((line, li) => {
      body += `<text x="${baseX + 34}" y="${y0 + 28 + li * 16}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#334155">${esc(line)}</text>`;
    });
  });
  body += `<text x="${x0}" y="132" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#64748b">USD billions; Gartner market categories, 2025-2027.</text>
  <circle cx="770" cy="96" r="7" fill="${colors[2025]}"/><text x="785" y="101" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#334155">2025</text>
  <circle cx="845" cy="96" r="7" fill="${colors[2026]}"/><text x="860" y="101" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#334155">2026</text>
  <circle cx="920" cy="96" r="7" fill="${colors[2027]}"/><text x="935" y="101" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#334155">2027</text>`;
  return svgShell("Worldwide AI Spending by Market", "Infrastructure remains the largest spending pool; services and software scale next.", body, width, height);
}

function competitorChart() {
  const metrics = ["workflow", "evidence", "automation", "governance", "memory"];
  const metricLabels = ["Workflow", "Evidence", "Automation", "Governance", "Memory"];
  const rows = data.competitors.map((c) => ({
    name: c.name,
    value: Math.round(metrics.reduce((sum, m) => sum + c[m], 0) / metrics.length),
  }));
  return barChart({
    titleText: "Competitive Capability Index",
    subtitleText: "Consulting-style 0-100 assessment of workflow coverage, evidence discipline, automation, governance, and memory.",
    rows,
    labelKey: "name",
    valueKey: "value",
    unit: "",
    color: "#1d4ed8",
    maxValue: 100,
  }).replace("</svg>", `<text x="56" y="575" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#64748b">Composite metrics: ${metricLabels.join(", ")}. Scores are directional strategic assessment, not reported market share.</text></svg>`);
}

function donutChart() {
  const width = 1100;
  const height = 620;
  const cx = 370;
  const cy = 330;
  const r = 165;
  const total = data.customerSegments.reduce((s, d) => s + d.value, 0);
  const colors = ["#0f2f57", "#2563eb", "#60a5fa", "#94a3b8", "#38bdf8"];
  let angle = -Math.PI / 2;
  let body = "";
  data.customerSegments.forEach((d, i) => {
    const next = angle + (d.value / total) * Math.PI * 2;
    const large = next - angle > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(next);
    const y2 = cy + r * Math.sin(next);
    body += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${colors[i]}"/>`;
    angle = next;
  });
  body += `<circle cx="${cx}" cy="${cy}" r="92" fill="#ffffff"/>
  <text x="${cx}" y="${cy - 5}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700" fill="#0f2f57">100%</text>
  <text x="${cx}" y="${cy + 25}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#64748b">target demand</text>`;
  data.customerSegments.forEach((d, i) => {
    const yy = 205 + i * 58;
    body += `<rect x="670" y="${yy - 18}" width="22" height="22" rx="5" fill="${colors[i]}"/>
    <text x="710" y="${yy}" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#334155">${esc(d.name)}</text>
    <text x="980" y="${yy}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#0f172a">${d.value}%</text>`;
  });
  return svgShell("Priority Customer Segments", "Estimated demand-weighting for a governed AI market intelligence platform.", body, width, height);
}

function opportunityChart() {
  const rows = data.opportunities.map((d) => ({
    opportunity: d.opportunity,
    value: Math.round((d.attractiveness + d.feasibility) / 2),
  }));
  return barChart({
    titleText: "Market Opportunity Ranking",
    subtitleText: "Average of attractiveness and feasibility scores; higher scores indicate near-term strategic priority.",
    rows,
    labelKey: "opportunity",
    valueKey: "value",
    unit: "",
    color: "#2563eb",
    maxValue: 100,
  });
}

function riskHeatmap() {
  const width = 1100;
  const height = 620;
  const x = 230;
  const y = 145;
  const cell = 70;
  let body = "";
  for (let i = 1; i <= 5; i += 1) {
    body += `<text x="${x + (i - 0.5) * cell}" y="${y - 18}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#64748b">${i}</text>
    <text x="${x - 25}" y="${y + (i - 0.5) * cell + 5}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#64748b">${6 - i}</text>`;
    for (let j = 1; j <= 5; j += 1) {
      const score = j * (6 - i);
      const fill = score >= 16 ? "#b91c1c" : score >= 10 ? "#f59e0b" : "#93c5fd";
      body += `<rect x="${x + (j - 1) * cell}" y="${y + (i - 1) * cell}" width="${cell - 4}" height="${cell - 4}" rx="8" fill="${fill}" opacity="0.72"/>`;
    }
  }
  data.risks.forEach((d, i) => {
    const dotX = x + (d.likelihood - 0.5) * cell;
    const dotY = y + (5 - d.impact + 0.5) * cell;
    body += `<circle cx="${dotX}" cy="${dotY}" r="17" fill="#0f2f57" stroke="#ffffff" stroke-width="4"/>
    <text x="${dotX}" y="${dotY + 5}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#ffffff">${i + 1}</text>`;
  });
  body += `<text x="${x + 2.5 * cell}" y="${y + 390}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#334155">Likelihood</text>
  <text transform="translate(${x - 105} ${y + 2.5 * cell}) rotate(-90)" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#334155">Impact</text>`;
  data.risks.forEach((d, i) => {
    body += `<text x="670" y="${180 + i * 54}" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#334155">${i + 1}. ${esc(d.risk)}</text>`;
  });
  return svgShell("Strategic Risk Heatmap", "Likelihood and impact scored 1-5; darker markers indicate priority mitigation topics.", body, width, height);
}

function radarChart() {
  const width = 1100;
  const height = 620;
  const cx = 550;
  const cy = 340;
  const r = 190;
  const items = data.swotCounts;
  const max = 5;
  let body = "";
  for (let ring = 1; ring <= max; ring += 1) {
    const points = items.map((_, i) => {
      const a = -Math.PI / 2 + (i / items.length) * Math.PI * 2;
      return `${cx + (r * ring / max) * Math.cos(a)},${cy + (r * ring / max) * Math.sin(a)}`;
    }).join(" ");
    body += `<polygon points="${points}" fill="none" stroke="#dbe4ef"/>`;
  }
  items.forEach((item, i) => {
    const a = -Math.PI / 2 + (i / items.length) * Math.PI * 2;
    body += `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="#dbe4ef"/>
    <text x="${cx + (r + 56) * Math.cos(a)}" y="${cy + (r + 42) * Math.sin(a)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#334155">${esc(item.area)}</text>`;
  });
  const points = items.map((item, i) => {
    const a = -Math.PI / 2 + (i / items.length) * Math.PI * 2;
    return `${cx + (r * item.value / max) * Math.cos(a)},${cy + (r * item.value / max) * Math.sin(a)}`;
  }).join(" ");
  body += `<polygon points="${points}" fill="#2563eb" opacity="0.28" stroke="#1d4ed8" stroke-width="4"/>`;
  return svgShell("SWOT Balance Radar", "Count of material SWOT factors identified for the platform and market-entry strategy.", body, width, height);
}

async function buildCharts() {
  await saveChart("ai_spending_by_market", groupedBarChart());
  await saveChart("ai_adoption_value_gap", barChart({
    titleText: "AI Adoption and Value Capture Gap",
    subtitleText: "Adoption is broad, but scaling and enterprise-level EBIT impact still lag.",
    rows: data.adoption,
    labelKey: "metric",
    valueKey: "value",
    unit: "%",
    color: "#2563eb",
    maxValue: 100,
  }));
  await saveChart("ai_private_investment_gap", barChart({
    titleText: "Private AI Investment Concentration",
    subtitleText: "2025 private AI investment by country, USD billions.",
    rows: data.investment,
    labelKey: "region",
    valueKey: "value",
    unit: "B",
    color: "#0f2f57",
    maxValue: 300,
  }));
  await saveChart("competitive_capability_index", competitorChart());
  await saveChart("customer_segments", donutChart());
  await saveChart("market_opportunity_ranking", opportunityChart());
  await saveChart("risk_heatmap", riskHeatmap());
  await saveChart("swot_radar", radarChart());
  await saveChart("ai_governance_risk_indicators", barChart({
    titleText: "AI Governance Risk Indicators",
    subtitleText: "Security and oversight metrics from IBM's 2025 breach research.",
    rows: [
      { metric: "Lacked AI access controls", value: 97 },
      { metric: "No/developing AI governance", value: 63 },
      { metric: "AI incidents compromised data", value: 60 },
      { metric: "AI model/app breaches", value: 13 },
    ],
    labelKey: "metric",
    valueKey: "value",
    unit: "%",
    color: "#1e40af",
    maxValue: 100,
  }));
}

function refLinks(refs) {
  return refs.map(([label, url]) => `[${label}](${url})`).join(" | ");
}

const sectionRefs = {
  executive: [["README", sources.readme], ["Architecture", sources.architecture], ["McKinsey State of AI", sources.mckinsey], ["Gartner AI Spending", sources.gartner]],
  market: [["Gartner AI Spending", sources.gartner], ["Stanford AI Index 2026", sources.stanford], ["McKinsey State of AI", sources.mckinsey]],
  trends: [["Stanford AI Index 2026", sources.stanford], ["McKinsey State of AI", sources.mckinsey], ["Gartner AI Spending", sources.gartner]],
  competitors: [["README", sources.readme], ["Architecture", sources.architecture], ["Assistant Controller", sources.assistant]],
  swot: [["README", sources.readme], ["Architecture", sources.architecture], ["IBM Cost of a Data Breach", sources.ibm]],
  customers: [["McKinsey State of AI", sources.mckinsey], ["Assistant Controller", sources.assistant], ["Dashboard Controller", sources.dashboard]],
  opportunities: [["Gartner AI Spending", sources.gartner], ["McKinsey State of AI", sources.mckinsey], ["API Routes", sources.api]],
  risks: [["IBM Cost of a Data Breach", sources.ibm], ["IBM Newsroom", sources.ibmNews], ["Stanford AI Index 2026", sources.stanford], ["Architecture", sources.architecture]],
  recommendations: [["Architecture", sources.architecture], ["API Routes", sources.api], ["McKinsey State of AI", sources.mckinsey], ["IBM Cost of a Data Breach", sources.ibm]],
  charts: [["Assistant Controller", sources.assistant], ["Gartner AI Spending", sources.gartner], ["McKinsey State of AI", sources.mckinsey], ["Stanford AI Index 2026", sources.stanford], ["IBM Cost of a Data Breach", sources.ibm]],
  appendix: [["README", sources.readme], ["Architecture", sources.architecture], ["API Routes", sources.api], ["Testing Notes", sources.testing]],
};

function markdownReport() {
  return `---
title: "${title}"
subtitle: "${subtitle}"
date: "${reportDate}"
company: "${company}"
---

<div class="cover-page">

# ${title}

## ${subtitle}

**Date:** ${reportDate}<br>

**Company / Project:** ${company}<br>

**Prepared for:** Executive strategy review<br>

**Theme:** Blue / white / gray consulting report

</div>

\\newpage

## Table of Contents

- [Executive Summary](#executive-summary)
- [Market Overview](#market-overview)
- [Industry Trends](#industry-trends)
- [Competitor Analysis](#competitor-analysis)
- [SWOT Analysis](#swot-analysis)
- [Customer Insights](#customer-insights)
- [Market Opportunities](#market-opportunities)
- [Risk Analysis](#risk-analysis)
- [AI-generated Strategic Recommendations](#ai-generated-strategic-recommendations)
- [Interactive Charts](#interactive-charts)
- [Data Tables](#data-tables)
- [References](#references)
- [Appendix](#appendix)

\\newpage

## Executive Summary

### Board-Level Takeaways

| Decision Topic | Executive View | Implication |
|---|---|---|
| Market timing | AI spend and adoption are accelerating sharply, but value capture is uneven. | Prioritize use cases that close the evidence-to-decision gap, not generic AI productivity. |
| Strategic wedge | The engine's strongest position is governed, source-backed research automation for consultants and corporate strategy teams. | Lead with workflow governance, auditability, and reusable research memory. |
| Competitive position | Incumbents are strong in content, data, and advisory brands; the project differentiates through end-to-end agentic workflow orchestration. | Build defensibility around evidence lineage, validation, reviewer approvals, and Qdrant-backed memory. |
| Risk posture | AI governance and security gaps are material market concerns. | Productize trust controls as core functionality, not compliance afterthoughts. |
| Recommended stance | Proceed with focused commercialization around enterprise strategy workflows. | Target high-value teams with repeatable research cadences and board-facing outputs. |

### KPI Snapshot

${data.kpis.map(([metric, value, note]) => `> **${metric}: ${value}** - ${note}`).join("\n\n")}

![AI adoption and value capture gap](${chartFiles.ai_adoption_value_gap})

**Sources:** ${refLinks(sectionRefs.executive)}

## Market Overview

### Market Definition

The relevant market is the intersection of:

| Layer | Description | Buying Trigger |
|---|---|---|
| AI research automation | Agentic workflows that plan, search, extract, validate, aggregate, and draft research. | Faster strategy cycles and analyst leverage. |
| Market intelligence platforms | Competitive, customer, trend, and market signal monitoring. | Need for source-backed decisions and repeatable tracking. |
| Consulting enablement | Executive-ready outputs, evidence review, audit trail, and reusable knowledge. | Need for board-quality deliverables with governance. |

### Market Scale Signals

| Metric | Value | Interpretation |
|---|---:|---|
| Worldwide AI spending forecast, 2026 | $2.59T | Large budget pool, with infrastructure leading but enterprise applications accelerating. |
| AI spending growth, 2026 | 47% | Demand is expanding faster than most enterprise software categories. |
| AI infrastructure spending, 2026 | $1.43T | Compute-heavy ecosystem creates opportunity for workflow tools that prove ROI. |
| AI services spending, 2026 | $585.5B | Consulting and implementation budgets remain meaningful adoption channels. |
| Organizations using AI in at least one function | 88% | Adoption is mainstream; differentiation shifts to value capture and governance. |

![Worldwide AI spending by market](${chartFiles.ai_spending_by_market})

![Private AI investment gap](${chartFiles.ai_private_investment_gap})

**Sources:** ${refLinks(sectionRefs.market)}

## Industry Trends

| Trend | Evidence Signal | Strategic Meaning |
|---|---|---|
| Agentic workflows move from pilots to operations | 62% of McKinsey respondents are experimenting with or scaling AI agents. | Workflow orchestration becomes the enterprise buying frame. |
| Value capture lags adoption | 88% regular AI use versus 39% enterprise-level EBIT impact. | Buyers will reward tools that connect AI output to measurable decisions. |
| AI infrastructure arms race continues | Gartner forecasts infrastructure as the largest AI spending category through 2027. | SaaS tools must show clear leverage on expensive AI consumption. |
| Frontier-model competition compresses | Stanford reports the U.S.-China performance gap has effectively closed. | Product differentiation cannot depend only on model access. |
| Responsible AI becomes a commercial requirement | Stanford reports documented AI incidents rose from 233 in 2024 to 362. | Governance, validation, and audit logs should be core selling points. |

### Implications for the Project

- Make evidence quality, reviewer approval, and source lineage visible in every workflow.
- Position the engine as a decision system for strategy work, not only a chatbot or dashboard.
- Package repeatable playbooks by use case: competitor monitoring, market entry, customer segmentation, investment thesis, and risk tracking.

![AI adoption and value capture gap](${chartFiles.ai_adoption_value_gap})

**Sources:** ${refLinks(sectionRefs.trends)}

## Competitor Analysis

### Competitive Landscape

| Competitor / Archetype | Core Strength | Relative Gap | Strategic Response |
|---|---|---|---|
| AI Market Strategy Engine | End-to-end governed research workflow, validation, memory, and reports. | Needs external brand credibility and production usage proof. | Demonstrate repeatable outcomes and evidence quality. |
| AlphaSense | Enterprise content discovery and financial research workflows. | Less differentiated in custom agentic research orchestration. | Emphasize planning-to-report workflow automation. |
| CB Insights | Startup, market, and technology intelligence data. | Dataset-led rather than custom research-agent workflow-led. | Partner or integrate where structured external data matters. |
| Gartner | Brand authority, analyst trust, executive advisory. | High-cost advisory model with less self-serve workflow automation. | Compete on speed, customization, and evidence traceability. |
| Similarweb | Digital traffic and competitive web analytics. | Strong signal data, narrower strategy-reporting workflow. | Integrate digital demand signals into broader strategy views. |
| Perplexity Enterprise | Fast answer generation and source discovery. | Less specialized for governed consulting deliverables. | Differentiate on review, audit, workflow state, and reusable knowledge. |

![Competitive capability index](${chartFiles.competitive_capability_index})

### Win Themes

- **Workflow depth:** Intake, planning, approval, browsing, extraction, validation, aggregation, report writing, and feedback.
- **Evidence discipline:** Source records, confidence scores, validation results, and reviewer decisions.
- **Memory advantage:** Qdrant-backed knowledge memory for reusable market insights and competitor movements.
- **Executive packaging:** Dashboards and report-generation surfaces built for consulting-grade outputs.

**Sources:** ${refLinks(sectionRefs.competitors)}

## SWOT Analysis

| Strengths | Weaknesses |
|---|---|
| Governed multi-agent research workflow. | External market data still requires source validation. |
| Evidence records, confidence scores, reviewer actions, and audit logs. | AI provider quota and availability dependency. |
| Qdrant-backed reusable market memory. | Needs clear production proof points and customer benchmarks. |
| Broad dashboard modules: market, competition, SWOT, forecasting, evidence review, and reports. | Integrations and data partnerships are still a scale requirement. |

| Opportunities | Threats |
|---|---|
| Agentic research automation for strategy teams. | Incumbents can bundle AI into existing research subscriptions. |
| Evidence-backed board and investment committee reporting. | Trust failures from unverified or outdated sources. |
| Vertical research playbooks by industry. | Regulatory, privacy, and model governance expectations are rising. |
| Competitive intelligence memory and monitoring. | Buyer fatigue if AI value is not tied to measurable outcomes. |
| Governance-led AI adoption enablement. | Model/API cost volatility and quota constraints. |

![SWOT radar](${chartFiles.swot_radar})

**Sources:** ${refLinks(sectionRefs.swot)}

## Customer Insights

### Primary Buyer Segments

| Segment | Estimated Demand Share | Need State | Purchase Driver |
|---|---:|---|---|
| Strategy consulting | 34% | Faster expert-grade market scans and client-ready reports. | Utilization leverage and repeatable delivery quality. |
| Corporate strategy | 27% | Always-on competitor, trend, and risk monitoring. | Faster executive decision cycles. |
| Product marketing | 20% | Messaging, segment, pricing, and competitor insights. | Launch planning and positioning clarity. |
| Private equity | 12% | Diligence, market mapping, and thesis validation. | Time-compressed investment decisions. |
| Innovation teams | 7% | Emerging technology and opportunity discovery. | Portfolio prioritization. |

![Customer segments](${chartFiles.customer_segments})

### Customer Buying Criteria

| Criterion | Why It Matters | Product Proof Point |
|---|---|---|
| Source credibility | Executives need defensible findings. | Evidence records, source relationships, confidence scoring. |
| Review control | AI output requires human accountability. | Reviewer/admin approval, reject, and flag actions. |
| Repeatability | Research must become a system, not one-off prompting. | Research plans, jobs, templates, and memory. |
| Output quality | Users need board-ready artifacts. | Reports page, export flow, executive dashboards. |

**Sources:** ${refLinks(sectionRefs.customers)}

## Market Opportunities

| Opportunity | Attractiveness | Feasibility | Recommended Move |
|---|---:|---:|---|
${data.opportunities.map((o) => `| ${o.opportunity} | ${o.attractiveness} | ${o.feasibility} | ${opportunityMove(o.opportunity)} |`).join("\n")}

![Market opportunity ranking](${chartFiles.market_opportunity_ranking})

### Opportunity Prioritization

- **Near term:** Governed agentic research and evidence-backed board reporting.
- **Mid term:** Competitive intelligence memory and vertical playbooks.
- **Longer term:** Data partnership marketplace after workflow demand is proven.

**Sources:** ${refLinks(sectionRefs.opportunities)}

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
${data.risks.map((r) => `| ${r.risk} | ${r.likelihood}/5 | ${r.impact}/5 | ${riskMitigation(r.risk)} |`).join("\n")}

![Strategic risk heatmap](${chartFiles.risk_heatmap})

![AI governance risk indicators](${chartFiles.ai_governance_risk_indicators})

### Risk Readout

- AI security and governance have become buying requirements for enterprise AI systems.
- The product should surface data provenance, reviewer status, model/provider state, and confidence in the primary UX.
- Commercial messaging should treat governance as a productivity accelerator: less rework, fewer unsupported claims, and easier executive sign-off.

**Sources:** ${refLinks(sectionRefs.risks)}

## AI-generated Strategic Recommendations

| Priority | Recommendation | Rationale | Success Metric |
|---|---|---|---|
| 1 | Launch with a governed research-workflow wedge. | Buyers have AI access but still struggle to scale trusted value. | 30% reduction in analyst research cycle time. |
| 2 | Make evidence lineage the product's signature feature. | Differentiates against chat-first and content-only competitors. | 90%+ cited claims with source, confidence, and reviewer status. |
| 3 | Package three executive workflows. | Simpler sales motion and faster activation. | Time-to-first-report under one business day. |
| 4 | Build integrations selectively. | Strategy users need credible source inputs, not broad integration sprawl. | Top 5 data/source connectors used in 80% of active accounts. |
| 5 | Establish a governance scorecard. | AI risk is now a board-level concern. | Every report includes source quality, confidence, and risk flags. |

### 90-Day Roadmap

| Timeframe | Workstream | Actions |
|---|---|---|
| Days 0-30 | Product proof | Create benchmark demos for competitor tracking, market entry, and diligence workflows. |
| Days 31-60 | Trust layer | Add exportable source-quality scorecards and reviewer-ready evidence summaries. |
| Days 61-90 | Commercial packaging | Define enterprise pilot offer, pricing hypothesis, ROI model, and success metrics. |

**Sources:** ${refLinks(sectionRefs.recommendations)}

## Interactive Charts

The exported report embeds static PNG versions of the chart pack so the PDF is self-contained. The Markdown keeps chart paths clickable for direct inspection or reuse.

| Chart | File | Use |
|---|---|---|
| AI spending by market | [PNG](${chartFiles.ai_spending_by_market}) | Market overview and budget pool sizing. |
| AI adoption and value gap | [PNG](${chartFiles.ai_adoption_value_gap}) | Industry trend and executive case for workflow discipline. |
| AI private investment gap | [PNG](${chartFiles.ai_private_investment_gap}) | Market momentum and geographic concentration. |
| Competitive capability index | [PNG](${chartFiles.competitive_capability_index}) | Competitor analysis. |
| Customer segments | [PNG](${chartFiles.customer_segments}) | Target buyer segmentation. |
| Market opportunity ranking | [PNG](${chartFiles.market_opportunity_ranking}) | Prioritization. |
| Strategic risk heatmap | [PNG](${chartFiles.risk_heatmap}) | Risk management. |
| AI governance indicators | [PNG](${chartFiles.ai_governance_risk_indicators}) | Governance and security case. |
| SWOT radar | [PNG](${chartFiles.swot_radar}) | Strategic balance. |

**Sources:** ${refLinks(sectionRefs.charts)}

## Data Tables

### Gartner Worldwide AI Spending by Market

| Market | 2025, USD millions | 2026, USD millions | 2027, USD millions |
|---|---:|---:|---:|
${data.spending.map((r) => `| ${r.market} | ${fmt(r[2025])} | ${fmt(r[2026])} | ${fmt(r[2027])} |`).join("\n")}

### Adoption and Value-Capture Indicators

| Indicator | Value |
|---|---:|
${data.adoption.map((r) => `| ${r.metric} | ${r.value}% |`).join("\n")}

### Competitive Capability Scores

| Competitor | Workflow | Evidence | Automation | Governance | Memory | Composite |
|---|---:|---:|---:|---:|---:|---:|
${data.competitors.map((c) => `| ${c.name} | ${c.workflow} | ${c.evidence} | ${c.automation} | ${c.governance} | ${c.memory} | ${Math.round((c.workflow + c.evidence + c.automation + c.governance + c.memory) / 5)} |`).join("\n")}

**Sources:** ${refLinks(sectionRefs.charts)}

## References

| Source | Link |
|---|---|
| Gartner AI spending forecast, May 19, 2026 | [Gartner](${sources.gartner}) |
| Stanford 2026 AI Index Report | [Stanford HAI](${sources.stanford}) |
| McKinsey State of AI 2025 | [McKinsey](${sources.mckinsey}) |
| IBM Cost of a Data Breach Report 2025 | [IBM](${sources.ibm}) |
| IBM AI breach newsroom release, July 30, 2025 | [IBM Newsroom](${sources.ibmNews}) |
| Project README | [README](${sources.readme}) |
| Project architecture | [ARCHITECTURE.md](${sources.architecture}) |
| Project API routes | [API.md](${sources.api}) |
| Assistant analysis schema | [assistant.controller.js](${sources.assistant}) |
| Dashboard aggregation controller | [dashboard.controller.js](${sources.dashboard}) |

## Appendix

### Product Architecture Summary

| Layer | Current Project Evidence |
|---|---|
| Frontend | Next.js 15, Tailwind CSS, shadcn-style components, Redux Toolkit, React Query, Recharts, Axios. |
| Backend | Express, JWT auth, Bcrypt, Mongoose, LangGraph, DeepSeek, Tavily, Firecrawl, Playwright, Qdrant. |
| Workflow | Intake, planning, approval, web research, extraction, validation, aggregation, report generation, review, audit logs, memory. |
| Governance | Plan approval, evidence relationships, confidence scores, reviewer actions, audit logs. |
| Memory | Knowledge records and optional Qdrant collection storage. |

### Assumptions and Limits

- Market-size and adoption figures are sourced from public analyst/research references listed above.
- Competitive capability scores are directional strategy assessments based on product positioning and project capabilities; they are not reported market shares.
- Customer segment percentages are planning estimates for prioritization and should be validated through interviews, pilots, and CRM evidence.
- The report is generated as a static executive artifact; live dashboard interactivity remains in the application UI.

### Suggested Validation Plan

| Validation Item | Method | Target Evidence |
|---|---|---|
| Buyer willingness to pay | 10-15 discovery calls by target segment. | Pain severity, budget owner, buying trigger, price range. |
| Workflow ROI | Timed benchmark against manual research. | Analyst hours saved, rework avoided, source coverage. |
| Trust controls | Reviewer usability test. | Approval time, rejected-claim rate, confidence-score usefulness. |
| Data-source value | Connector pilot. | Source usage, citation quality, report acceptance. |

**Sources:** ${refLinks(sectionRefs.appendix)}
`;
}

function fmt(n) {
  return Number(n).toLocaleString("en-US");
}

function opportunityMove(opportunity) {
  if (/Governed/.test(opportunity)) return "Ship as flagship pilot workflow.";
  if (/board/.test(opportunity)) return "Bundle with executive PDF/report export.";
  if (/memory/.test(opportunity)) return "Use Qdrant knowledge memory as switching-cost driver.";
  if (/Vertical/.test(opportunity)) return "Create 3 industry templates before broad expansion.";
  return "Defer until source partnerships and usage data justify complexity.";
}

function riskMitigation(risk) {
  if (/provider/.test(risk)) return "Multi-provider abstraction, quota monitoring, deterministic fallback outputs.";
  if (/source/.test(risk)) return "Mandatory citations, source freshness metadata, reviewer approval gates.";
  if (/Privacy/.test(risk)) return "RBAC, audit logs, data retention controls, AI access governance.";
  if (/Incumbent/.test(risk)) return "Differentiate on workflow depth, evidence lineage, and speed.";
  return "Onboarding analytics, workflow templates, and executive success metrics.";
}

function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  const html = [];
  let inTable = false;
  let inQuote = false;
  let inList = false;
  let para = [];

  function flushPara() {
    if (para.length) {
      html.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  }
  function closeList() {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  }
  function closeQuote() {
    if (inQuote) {
      html.push("</blockquote>");
      inQuote = false;
    }
  }
  function closeTable() {
    if (inTable) {
      html.push("</tbody></table>");
      inTable = false;
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith("---")) {
      while (i + 1 < lines.length && !lines[i + 1].startsWith("---")) i += 1;
      i += 1;
      continue;
    }
    if (!line.trim()) {
      flushPara(); closeList(); closeQuote(); closeTable();
      continue;
    }
    if (line.startsWith("<div")) {
      flushPara(); closeList(); closeQuote(); closeTable();
      html.push(line);
      continue;
    }
    if (line.startsWith("</div")) {
      flushPara(); closeList(); closeQuote(); closeTable();
      html.push(line);
      continue;
    }
    if (line === "\\newpage") {
      flushPara(); closeList(); closeQuote(); closeTable();
      html.push(`<div class="page-break"></div>`);
      continue;
    }
    const img = line.match(/^!\[(.+?)\]\((.+?)\)$/);
    if (img) {
      flushPara(); closeList(); closeQuote(); closeTable();
      html.push(`<figure><img src="${esc(img[2])}" alt="${esc(img[1])}"/><figcaption>${esc(img[1])}</figcaption></figure>`);
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushPara(); closeList(); closeQuote(); closeTable();
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = slug(text);
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      continue;
    }
    if (line.startsWith("> ")) {
      flushPara(); closeList(); closeTable();
      if (!inQuote) {
        html.push("<blockquote>");
        inQuote = true;
      }
      html.push(`<p>${inline(line.slice(2))}</p>`);
      continue;
    }
    if (line.startsWith("- ")) {
      flushPara(); closeQuote(); closeTable();
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    if (/^\|.+\|$/.test(line)) {
      flushPara(); closeList(); closeQuote();
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      const next = lines[i + 1] || "";
      if (!inTable && /^\|[\s:-]+\|/.test(next)) {
        html.push("<table><thead><tr>" + cells.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>");
        inTable = true;
        i += 1;
      } else if (inTable) {
        html.push("<tr>" + cells.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>");
      }
      continue;
    }
    closeTable(); closeList(); closeQuote();
    para.push(line);
  }
  flushPara(); closeList(); closeQuote(); closeTable();
  return html.join("\n");
}

function inline(value) {
  return esc(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function htmlDocument(body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${esc(title)}</title>
<style>
  :root {
    --navy: #0f2f57;
    --blue: #2563eb;
    --light-blue: #eaf2ff;
    --text: #172033;
    --muted: #667085;
    --line: #d9e2ef;
    --soft: #f6f8fb;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    color: var(--text);
    background: white;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10.5pt;
    line-height: 1.42;
  }
  .report {
    max-width: 980px;
    margin: 0 auto;
    padding: 0 20px;
  }
  .cover-page {
    min-height: 870px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px 58px;
    background:
      linear-gradient(90deg, var(--navy) 0 13px, transparent 13px),
      linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    border: 1px solid var(--line);
  }
  .cover-page h1 {
    max-width: 760px;
    margin: 0 0 18px;
    color: var(--navy);
    font-size: 48pt;
    line-height: 0.98;
    letter-spacing: 0;
  }
  .cover-page h2 {
    max-width: 690px;
    margin: 0 0 44px;
    color: #334155;
    font-size: 17pt;
    font-weight: 500;
  }
  .cover-page p {
    color: #475569;
    font-size: 12pt;
    margin: 7px 0;
  }
  h1, h2, h3, h4 {
    color: var(--navy);
    line-height: 1.18;
    letter-spacing: 0;
    page-break-after: avoid;
  }
  h1 { font-size: 28pt; margin: 34px 0 16px; }
  h2 {
    border-top: 4px solid var(--navy);
    padding-top: 14px;
    margin: 34px 0 14px;
    font-size: 22pt;
  }
  h3 { color: #1e3a8a; margin: 22px 0 10px; font-size: 14pt; }
  h4 { margin: 18px 0 8px; font-size: 12pt; }
  p { margin: 7px 0 10px; }
  a { color: #1d4ed8; text-decoration: none; }
  ul { margin: 7px 0 14px 21px; padding: 0; }
  li { margin: 4px 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 18px;
    page-break-inside: avoid;
    font-size: 9.2pt;
  }
  th {
    background: var(--navy);
    color: white;
    text-align: left;
    padding: 8px 9px;
    font-weight: 700;
  }
  td {
    border-bottom: 1px solid var(--line);
    padding: 8px 9px;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #f8fafc; }
  blockquote {
    margin: 10px 0 16px;
    padding: 12px 14px;
    border-left: 4px solid var(--blue);
    background: var(--light-blue);
    page-break-inside: avoid;
  }
  blockquote p {
    margin: 4px 0;
    font-size: 10pt;
  }
  figure {
    margin: 14px 0 22px;
    page-break-inside: avoid;
    border: 1px solid var(--line);
    background: #ffffff;
    padding: 8px;
  }
  figure img {
    display: block;
    width: 100%;
    height: auto;
  }
  figcaption {
    color: var(--muted);
    font-size: 8.5pt;
    margin-top: 5px;
  }
  .page-break { break-after: page; page-break-after: always; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    h2 { break-before: page; }
    .cover-page h1, .cover-page h2 { break-before: auto; }
  }
</style>
</head>
<body><main class="report">${body}</main></body>
</html>`;
}

async function exportPdf(htmlPath, pdfPath) {
  const browserCandidates = [
    chromium.executablePath(),
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  const executablePath = browserCandidates.find((candidate) => candidate && fs.existsSync(candidate));
  if (!executablePath) throw new Error("No Chromium-compatible browser executable was found for PDF export.");
  const browser = await chromium.launch({
    headless: true,
    executablePath,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1600 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    margin: { top: "72px", right: "48px", bottom: "72px", left: "48px" },
    headerTemplate: `<div style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:8px;color:#64748b;padding:0 48px;border-bottom:1px solid #d9e2ef;">${esc(title)} | Executive Strategy Report</div>`,
    footerTemplate: `<div style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:8px;color:#64748b;padding:0 48px;border-top:1px solid #d9e2ef;display:flex;justify-content:space-between;"><span>${esc(company)}</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
    preferCSSPageSize: false,
  });
  await page.screenshot({ path: path.join(dirs.pdf, "final_report_html_preview.png"), fullPage: false });
  await browser.close();
}

function validateArtifacts(mdPath, htmlPath, pdfPath) {
  const required = [mdPath, htmlPath, pdfPath, ...Object.keys(chartFiles).map((key) => path.join(dirs.charts, `${key}.png`))];
  for (const file of required) {
    const stat = fs.statSync(file);
    if (!stat.size) throw new Error(`Generated file is empty: ${file}`);
  }
  const pdf = fs.readFileSync(pdfPath);
  const pageMatches = String(pdf).match(/\/Type\s*\/Page\b/g) || [];
  const chartRefs = Object.values(chartFiles).filter((ref) => fs.readFileSync(mdPath, "utf8").includes(ref));
  return {
    pdfBytes: pdf.length,
    estimatedPages: pageMatches.length,
    chartCount: chartRefs.length,
  };
}

await buildCharts();
const md = markdownReport();
const mdPath = path.join(dirs.reports, "AI_Market_Strategy_Engine_Final_Report.md");
const htmlPath = path.join(dirs.html, "AI_Market_Strategy_Engine_Final_Report.html");
const pdfPath = path.join(dirs.pdf, "AI_Market_Strategy_Engine_Final_Report.pdf");

fs.writeFileSync(mdPath, md, "utf8");
fs.writeFileSync(htmlPath, htmlDocument(mdToHtml(md)), "utf8");
await exportPdf(htmlPath, pdfPath);
const validation = validateArtifacts(mdPath, htmlPath, pdfPath);

console.log(JSON.stringify({
  markdown: mdPath,
  html: htmlPath,
  pdf: pdfPath,
  charts: dirs.charts,
  validation,
}, null, 2));
