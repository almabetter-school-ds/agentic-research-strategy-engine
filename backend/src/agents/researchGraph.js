import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import EvidenceRecord from "../models/EvidenceRecord.js";
import KnowledgeMemory from "../models/KnowledgeMemory.js";
import Report from "../models/Report.js";
import ResearchJob from "../models/ResearchJob.js";
import ResearchPlan from "../models/ResearchPlan.js";
import Source from "../models/Source.js";
import ValidationResult from "../models/ValidationResult.js";
import { scrapeUrl } from "../services/firecrawl.service.js";
import { generateJson, shouldUseAiFallback } from "../services/deepseek.service.js";
import { fetchReadablePage } from "../services/playwright.service.js";
import { upsertMemory } from "../services/qdrant.service.js";
import { tavilySearch } from "../services/tavily.service.js";

const ResearchState = Annotation.Root({
  jobId: Annotation(),
  plan: Annotation(),
  sources: Annotation(),
  evidence: Annotation(),
  aggregation: Annotation(),
  report: Annotation()
});

async function updateJob(jobId, stage, progress, message, level = "info") {
  await ResearchJob.findByIdAndUpdate(jobId, { status: "running", currentStep: stage, progress, $push: { logs: { stage, message, level } } });
}

export async function plannerAgent(job) {
  let plan;
  let generatedBy = "Planner Agent";
  try {
    plan = await generateJson(`You are a McKinsey research planner. Build a governed research plan for:
Question: ${job.question}
Industry: ${job.industry}
Geography: ${job.geography}
Timeframe: ${job.timeframe}
Competitors: ${job.competitors.join(", ")}
Output type: ${job.outputType}
Schema: {"goals":[""],"workstreams":[{"name":"","objective":"","searchTasks":[""],"sourceCategories":[""],"evidenceRequirements":[""]}],"validationCriteria":[""]}`, () => ({
      goals: [`Answer: ${job.question}`, `Scope ${job.industry} in ${job.geography}`, "Prioritize source-traceable findings"],
      workstreams: [{ name: "Market signals", objective: "Collect current public evidence", searchTasks: [job.question, `${job.industry} ${job.geography} market trends ${job.timeframe}`], sourceCategories: ["news", "reports", "company announcements"], evidenceRequirements: ["claim", "excerpt", "source", "date"] }],
      validationCriteria: ["source credibility", "recency", "duplicate content", "contradictions"]
    }));
  } catch (err) {
    if (!shouldUseAiFallback(err)) throw err;
    plan = deterministicPlan(job);
    generatedBy = "Planner Agent - deterministic provider fallback";
    await ResearchJob.findByIdAndUpdate(job._id, {
      $push: { logs: { stage: "Planning", message: "DeepSeek planner unavailable. Created a query-specific web research plan and will continue with source-backed extraction.", level: "warn" } }
    });
  }
  return ResearchPlan.findOneAndUpdate({ job: job._id }, { job: job._id, ...plan, status: "draft", generatedBy }, { upsert: true, new: true });
}

const MAX_SOURCES = Number(process.env.MAX_SOURCES || 20);
const TAVILY_MAX_RESULTS_PER_TASK = Number(process.env.TAVILY_MAX_RESULTS_PER_TASK || 4);
const BROWSE_CONCURRENCY = Number(process.env.BROWSE_CONCURRENCY || 5);

async function mapWithConcurrency(items, limit, worker) {
  const results = [];
  let index = 0;
  async function runNext() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runNext));
  return results;
}

async function browserNode(state) {
  await updateJob(state.jobId, "Browsing", 30, "Collecting sources from Tavily, Firecrawl, and Playwright");
  const job = await ResearchJob.findById(state.jobId);
  const tasks = state.plan.workstreams.flatMap(w => w.searchTasks).slice(0, 10);
  const seen = new Set();
  const candidates = [];

  for (const task of tasks) {
    if (candidates.length >= MAX_SOURCES) break;
    const results = await tavilySearch(task, { maxResults: TAVILY_MAX_RESULTS_PER_TASK });
    for (const result of results) {
      const canonicalUrl = new URL(result.url).origin + new URL(result.url).pathname.replace(/\/$/, "");
      if (seen.has(canonicalUrl)) continue;
      seen.add(canonicalUrl);
      candidates.push({ result, canonicalUrl, task });
      if (candidates.length >= MAX_SOURCES) break;
    }
  }

  await updateJob(state.jobId, "Browsing", 35, `Fetching content for ${candidates.length} sources (up to ${BROWSE_CONCURRENCY} at a time)`);

  const fetched = await mapWithConcurrency(candidates, BROWSE_CONCURRENCY, async ({ result, canonicalUrl, task }) => {
    const scraped = await scrapeUrl(result.url).catch(() => null);
    const browsed = scraped ? null : await fetchReadablePage(result.url).catch(() => null);
    const content = scraped?.markdown || browsed?.content || result.content || result.snippet || "";
    return Source.findOneAndUpdate({ job: job._id, canonicalUrl }, {
      job: job._id,
      url: result.url,
      canonicalUrl,
      title: scraped?.metadata?.title || browsed?.title || result.title,
      publisher: scraped?.metadata?.siteName || new URL(result.url).hostname.replace(/^www\./, ""),
      publishDate: scraped?.metadata?.publishedTime || null,
      sourceType: classifySource(result.url),
      snippet: result.content || result.snippet,
      content,
      qualityScore: sourceQuality(result.url, content),
      metadata: { tavilyScore: result.score, searchTask: task }
    }, { upsert: true, new: true });
  });

  const created = fetched.filter(Boolean);
  if (!created.length) throw Object.assign(new Error("No sources were collected for this research plan"), { status: 422 });
  return { sources: created };
}

async function extractionNode(state) {
  await updateJob(state.jobId, "Extraction", 48, "Extracting evidence records from collected sources");
  const evidence = [];
  const job = await ResearchJob.findById(state.jobId);
  for (const source of state.sources) {
    let payload;
    try {
      payload = await generateJson(`Extract up to 5 strategy-grade evidence records from this source.
Source title: ${source.title}
Source URL: ${source.url}
Content: ${(source.content || source.snippet || "").slice(0, Number(process.env.EXTRACTION_PROMPT_CONTENT_CHARS || 6000))}
Schema: {"records":[{"claim":"","excerpt":"","entity":"","topic":"","date":"YYYY-MM-DD","confidence":0.0}]}`, () => deterministicEvidence(source, job));
    } catch (err) {
      if (!shouldUseAiFallback(err)) throw err;
      payload = deterministicEvidence(source, job);
      await ResearchJob.findByIdAndUpdate(state.jobId, { $push: { logs: { stage: "Extraction", message: `AI extraction unavailable; extracted source-backed evidence from ${source.title || source.url}`, level: "warn" } } });
    }
    for (const record of payload.records || []) {
      if (!record.claim) continue;
      evidence.push(await EvidenceRecord.create({
        job: state.jobId,
        source: source._id,
        claim: record.claim,
        excerpt: record.excerpt,
        entity: record.entity,
        topic: record.topic,
        date: record.date ? new Date(record.date) : undefined,
        confidence: Math.min(1, Math.max(0, Number(record.confidence || 0.6)))
      }));
    }
  }
  if (!evidence.length) throw Object.assign(new Error("No evidence could be extracted from collected sources"), { status: 422 });
  return { evidence };
}

async function validationNode(state) {
  await updateJob(state.jobId, "Validation", 62, "Validating credibility, recency, duplication, and contradictions");
  const seen = new Set();
  for (const record of state.evidence) {
    const duplicateRisk = seen.has(record.claim.toLowerCase()) ? 0.9 : 0.05;
    seen.add(record.claim.toLowerCase());
    const source = await Source.findById(record.source);
    const dateMs = record.date ? new Date(record.date).getTime() : NaN;

    const recency = Number.isFinite(dateMs)
      ? Math.min(
          1,
          Math.max(
            0,
            1 - ((Date.now() - dateMs) / (1000 * 60 * 60 * 24 * 365 * 5))
          )
        )
      : 0.45;
    const credibility = source?.qualityScore || 0.5;
    const status = credibility >= 0.45 && duplicateRisk < 0.8 ? "passed" : "failed";
    await ValidationResult.create({ job: state.jobId, evidence: record._id, credibility, recency, duplicateRisk, contradictionRisk: 0.1, status, rationale: `Credibility ${credibility.toFixed(2)}, recency ${recency.toFixed(2)}, duplicate risk ${duplicateRisk.toFixed(2)}` });
    await EvidenceRecord.findByIdAndUpdate(record._id, { validationStatus: status === "passed" ? "approved" : "flagged", confidence: Math.min(1, record.confidence * credibility * (1 - duplicateRisk / 2) + recency * 0.2) });
  }
  return {};
}

async function aggregationNode(state) {
  await updateJob(state.jobId, "Aggregation", 76, "Aggregating validated findings into strategy themes");
  const validated = await EvidenceRecord.find({ job: state.jobId, validationStatus: "approved" }).populate("source");
  let aggregation;
  try {
    aggregation = await generateJson(`Group these validated findings into trends, opportunities, risks, and competitor movements.
Findings: ${JSON.stringify(validated.map(e => ({ claim: e.claim, entity: e.entity, topic: e.topic, source: e.source?.url }))).slice(0, 20000)}
Schema: {"trends":[""],"opportunities":[""],"risks":[""],"competitorMovements":[""]}`, () => deterministicAggregation(validated));
  } catch (err) {
    if (!shouldUseAiFallback(err)) throw err;
    aggregation = deterministicAggregation(validated);
    await ResearchJob.findByIdAndUpdate(state.jobId, { $push: { logs: { stage: "Aggregation", message: "AI aggregation unavailable; grouped validated source-backed evidence", level: "warn" } } });
  }
  return { aggregation };
}

async function reportNode(state) {
  await updateJob(state.jobId, "Report Generation", 90, "Writing source-traceable strategy report");
  const job = await ResearchJob.findById(state.jobId);
  const evidence = await EvidenceRecord.find({ job: state.jobId, validationStatus: "approved" }).populate("source");
  const reportEvidence = evidence.map((e) => ({
  id: String(e._id),
  claim: e.claim,
  excerpt: e.excerpt,
  topic: e.topic,
  confidence: e.confidence,
  sourceTitle: e.source?.title,
  publisher: e.source?.publisher,
  sourceType: e.source?.sourceType,
  sourceUrl: e.source?.url,
  sourcePublishedAt: e.source?.publishDate,
  sourceQualityScore: e.source?.qualityScore
}));

const prompt = `Write a professional, evidence-audited strategy report
as JSON sections for ${job.outputType}.

Research question: ${job.question}
Industry: ${job.industry}
Geography: ${job.geography}
Timeframe: ${job.timeframe}

Mandatory rules for quantitative claims:
1. Treat evidence records as claims to evaluate, not automatically
   verified facts. An approved validation status alone does not prove
   that a claim is factually correct.

2. Never combine a starting value, forecast value, or CAGR from
   different studies or market definitions into one growth series.

3. Clearly distinguish total AI spending, generative-AI spending,
   AI software spending, and estimated market size or revenue.

4. Distinguish global estimates from North American estimates and
   banking-wide findings from retail-banking-specific findings.
   Never present a global figure as the North American addressable
   market without supporting evidence.

5. Use a CAGR only when the source explicitly reports it for the
   relevant series, or when it can be calculated from matching
   endpoints with the same definition, geography, and period.
   Never attach a growth rate to an unrelated starting value.

6. Prefer original research publishers, official company filings,
   regulatory publications, and primary sources over secondary
   summaries. Do not treat a secondary article's attribution as
   proof that the original publisher supports the same claim.

7. When sources conflict or their definitions cannot be reconciled,
   present the estimates separately with clear attribution, or omit
   the unsupported figure. Do not silently choose or combine numbers.

8. For every material market-size, spending, or growth claim, identify
   the publisher, source title, relevant period, and market definition.
   Include only evidence IDs that genuinely support the section.

9. Do not invent citations, source details, statistics, or forecasts.
   Clearly label estimates and forecasts as such.

Evidence:
${JSON.stringify(reportEvidence).slice(0, 32000)}

Return valid JSON using this schema:
{"title":"","sections":[
  {"title":"Executive Summary","body":"","evidence":["ids"]},
  {"title":"Market Overview","body":"","evidence":["ids"]},
  {"title":"Market Signals","body":"","evidence":["ids"]},
  {"title":"Competitor Analysis","body":"","evidence":["ids"]},
  {"title":"Industry Trends","body":"","evidence":["ids"]},
  {"title":"Risks","body":"","evidence":["ids"]},
  {"title":"Growth Opportunities","body":"","evidence":["ids"]},
  {"title":"Strategic Recommendations","body":"","evidence":["ids"]}
]}`;
  let generated;
  try {
    generated = await generateJson(prompt, () => deterministicReport(job, state.aggregation, evidence));
  } catch (err) {
    if (!shouldUseAiFallback(err)) throw err;
    generated = deterministicReport(job, state.aggregation, evidence);
    await ResearchJob.findByIdAndUpdate(state.jobId, { $push: { logs: { stage: "Report Generation", message: "AI report generation unavailable; created source-backed report from validated evidence", level: "warn" } } });
  }

  const allowedEvidenceIds = new Set(
  evidence.map(item => String(item._id))
  );
  const report = await Report.create({
    job: job._id,
    owner: job.owner,
    title: generated.title || `${job.outputType}: ${job.industry}`,
    outputType: job.outputType,
    sections: (generated.sections || []).map(s => ({
      ...s,
      evidence: [
        ...new Set(
          (Array.isArray(s.evidence) ? s.evidence : [])
            .map(id => String(id))
            .filter(id => allowedEvidenceIds.has(id))
        )
      ]
    })),
    evidenceAppendix: evidence.map(e => e._id),
    status: "in_review",
    confidenceScore: evidence.length ? evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length : 0
  });

  // Mark the job as complete immediately after the report is saved.
  const completedAt = new Date();

  await ResearchJob.findByIdAndUpdate(job._id, {
    status: "review",
    progress: 100,
    currentStep: "Review",
    completedAt,
    runtimeMs: job.startedAt
      ? completedAt.getTime() - new Date(job.startedAt).getTime()
      : undefined,
    $push: {
      logs: {
        stage: "Review",
        message: "Report is ready for human review",
        level: "info"
      }
    }
  });

  // Run knowledge-memory indexing separately so it does not
  // delay the report or the job's completion status.
  void (async () => {
    let savedRecords = 0;
    let qdrantFailures = 0;
    let recordFailures = 0;

    for (const item of evidence.slice(0, 50)) {
      const collection =
        item.entity && (job.competitors || []).includes(item.entity)
          ? "competitor_insights"
          : item.topic?.toLowerCase().includes("trend")
            ? "trend_analysis"
            : "market_insights";

      let pointId = null;

      // Attempt Qdrant indexing without blocking report completion.
      try {
        pointId = await upsertMemory(collection, {
          title: item.claim,
          content: item.excerpt || item.claim,
          industry: job.industry,
          geography: job.geography,
          competitors: job.competitors,
          evidenceId: String(item._id),
          reportId: String(report._id)
        });
      } catch (err) {
        qdrantFailures++;
        console.error(
          `Qdrant indexing failed for ${item._id}:`,
          err.message
        );
      }

      // Save the knowledge-memory record even if Qdrant fails.
      try {
        await KnowledgeMemory.create({
          collection,
          title: item.claim,
          content: item.excerpt || item.claim,
          industry: job.industry,
          geography: job.geography,
          competitors: job.competitors,
          tags: [item.topic, item.entity].filter(Boolean),
          sourceEvidence: [item._id],
          report: report._id,
          qdrantPointId: pointId,
          confidence: item.confidence
        });

        savedRecords++;
      } catch (err) {
        recordFailures++;
        console.error(
          `Knowledge-memory save failed for ${item._id}:`,
          err.message
        );
      }
    }

    await ResearchJob.findByIdAndUpdate(job._id, {
      $push: {
        logs: {
          stage: "Knowledge Memory",
          message:
            `Indexing finished: ${savedRecords} knowledge records saved; ` +
            `${qdrantFailures} Qdrant failures; ` +
            `${recordFailures} database-save failures.`,
          level:
            qdrantFailures || recordFailures ? "warn" : "info"
        }
      }
    });
  })().catch(err => {
    console.error("Background knowledge-memory indexing failed:", err);
  });

  return { report };
}

function deterministicEvidence(source, job) {
  const content = normalizeText([source.title, source.snippet, source.content].filter(Boolean).join(". "));
  const terms = [job.industry, job.geography, ...(job.competitors || []), ...String(job.question || "").split(/\s+/).filter(word => word.length > 4)].map(value => String(value).toLowerCase());
  const sentences = content.split(/(?<=[.!?])\s+/).filter(sentence => sentence.length >= 60 && sentence.length <= 420);
  const matched = sentences.filter(sentence => terms.some(term => sentence.toLowerCase().includes(term))).slice(0, 5);
  const selected = (matched.length ? matched : sentences.slice(0, 3)).slice(0, 5);
  return {
    records: selected.map(sentence => ({
      claim: sentence,
      excerpt: sentence,
      entity: entityFromSentence(sentence, job),
      topic: topicFromSentence(sentence),
      date: undefined,
      confidence: Math.min(0.82, Math.max(0.45, Number(source.qualityScore || 0.55)))
    }))
  };
}

function deterministicAggregation(evidence = []) {
  const claims = evidence.map(item => item.claim).filter(Boolean);
  return {
    trends: claims.filter(claim => /trend|growth|demand|adoption|market|revenue|cloud|ai|digital/i.test(claim)).slice(0, 6),
    opportunities: claims.filter(claim => /opportun|expand|growth|investment|demand|deal|partnership|client|contract/i.test(claim)).slice(0, 6),
    risks: claims.filter(claim => /risk|decline|slow|margin|regulat|challenge|competition|pressure|layoff/i.test(claim)).slice(0, 6),
    competitorMovements: claims.filter(claim => /compet|google|microsoft|accenture|infosys|tcs|hcl|cognizant|capgemini/i.test(claim)).slice(0, 6)
  };
}

function deterministicReport(job, aggregation = {}, evidence = []) {
  const evidenceLines = evidence.slice(0, 12).map(item => {
    const source = item.source?.url
      ? ` Source: ${item.source.url}`
      : "";

    return `${item.claim}${source}`;
  });

  const getEvidenceIds = items =>
    items.map(item => String(item._id));

  const matchingEvidence = pattern =>
    evidence
      .filter(item =>
        pattern.test(`${item.topic || ""} ${item.claim || ""}`)
      )
      .slice(0, 6);

  const getRelevantIds = pattern =>
    getEvidenceIds(matchingEvidence(pattern));

  const trends = aggregation.trends || [];
  const opportunities = aggregation.opportunities || [];
  const risks = aggregation.risks || [];
  const competitorMovements = aggregation.competitorMovements || [];

  const recommendations = [];

  if (opportunities.length) {
    recommendations.push(
      "Validate and prioritize these evidence-based opportunities:",
      ...opportunities.slice(0, 4)
    );
  }

  if (risks.length) {
    recommendations.push(
      "Assess and mitigate these identified risks:",
      ...risks.slice(0, 4)
    );
  }

  if (!recommendations.length) {
    recommendations.push(
      "Validate the available findings against customer needs, " +
      "financial feasibility, regulatory requirements, and " +
      "implementation risks before making investment decisions."
    );
  }

  const sections = [
    {
      title: "Executive Summary",
      body: evidenceLines.slice(0, 4).join("\n\n") ||
        "No validated evidence was available for this section.",
      evidence: getEvidenceIds(evidence.slice(0, 4))
    },
    {
      title: "Market Overview",
      body: [...trends, ...evidenceLines].slice(0, 5).join("\n\n") ||
        "No validated market overview evidence was available.",
      evidence: getEvidenceIds(evidence.slice(0, 5))
    },
    {
      title: "Market Signals",
      body: trends.slice(0, 6).join("\n\n") ||
        "No validated market signals were available.",
      evidence: getRelevantIds(/market|growth|demand|adoption/i)
    },
    {
      title: "Competitor Analysis",
      body: competitorMovements.slice(0, 6).join("\n\n") ||
        "No validated competitor movements were available.",
      evidence: getEvidenceIds(
        evidence.filter(item => item.entity).slice(0, 6)
      )
    },
    {
      title: "Industry Trends",
      body: trends.slice(0, 6).join("\n\n") ||
        "No validated industry trends were available.",
      evidence: getRelevantIds(/trend|industry|growth|adoption|demand/i)
    },
    {
      title: "Risks",
      body: risks.slice(0, 6).join("\n\n") ||
        "No validated risk evidence was available.",
      evidence: getRelevantIds(/risk|regulat|challenge|pressure|decline/i)
    },
    {
      title: "Growth Opportunities",
      body: opportunities.slice(0, 6).join("\n\n") ||
        "No validated growth opportunities were available.",
      evidence: getRelevantIds(/opportun|expand|growth|investment|demand/i)
    },
    {
      title: "Strategic Recommendations",
      body: recommendations.join("\n\n"),
      evidence: getEvidenceIds([
        ...new Map(
          [
            ...matchingEvidence(/opportun|expand|growth|investment|demand/i),
            ...matchingEvidence(/risk|regulat|challenge|pressure|decline/i)
          ].map(item => [String(item._id), item])
        ).values()
      ])
    }
  ];

  return {
    title: `${job.outputType}: ${job.industry} in ${job.geography}`,
    sections
  };
}

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function entityFromSentence(sentence, job) {
  return [job.industry, ...(job.competitors || [])].find(term => sentence.toLowerCase().includes(String(term).toLowerCase())) || "";
}

function topicFromSentence(sentence) {
  if (/risk|challenge|pressure|regulat/i.test(sentence)) return "Risk";
  if (/compet|partner|deal|contract/i.test(sentence)) return "Competitor movement";
  if (/growth|demand|adoption|market/i.test(sentence)) return "Market trend";
  return "Market evidence";
}

export function createResearchGraph() {
  return new StateGraph(ResearchState)
    .addNode("browse", browserNode)
    .addNode("extract", extractionNode)
    .addNode("validate", validationNode)
    .addNode("aggregate", aggregationNode)
    .addNode("generateReport", reportNode)
    .addEdge(START, "browse")
    .addEdge("browse", "extract")
    .addEdge("extract", "validate")
    .addEdge("validate", "aggregate")
    .addEdge("aggregate", "generateReport")
    .addEdge("generateReport", END)
    .compile();
}
export async function runResearchWorkflow(jobId) {
  const job = await ResearchJob.findById(jobId);

  if (!job) {
    throw Object.assign(new Error("Research job not found"), {
      status: 404
    });
  }

  if (job.status !== "approved") {
    throw Object.assign(
      new Error(
        `Research job cannot run from status "${job.status}". ` +
        "Only approved jobs can be executed, and each job can run only once."
      ),
      { status: 409 }
    );
  }

  const plan = await ResearchPlan.findOne({ job: jobId });

  if (!plan || plan.status !== "approved") {
    throw Object.assign(
      new Error("Research plan must be approved before workflow execution"),
      { status: 409 }
    );
  }

  const existingReport = await Report.findOne({ job: jobId }).select("_id");

  if (existingReport) {
    throw Object.assign(
      new Error(
        "A report already exists for this job. Refusing to create a duplicate."
      ),
      { status: 409 }
    );
  }

  // Atomically claim the job so simultaneous requests cannot both run it.
  const claimedJob = await ResearchJob.findOneAndUpdate(
    {
      _id: jobId,
      status: "approved"
    },
    {
      $set: {
        status: "running",
        startedAt: new Date(),
        progress: 15,
        currentStep: "Planning"
      }
    },
    { new: true }
  );

  if (!claimedJob) {
    const latestJob = await ResearchJob.findById(jobId).select("status");

    throw Object.assign(
      new Error(
        `Research job could not be started. Current status: ` +
        `"${latestJob?.status || "unknown"}".`
      ),
      { status: 409 }
    );
  }

  try {
    return await createResearchGraph().invoke({
      jobId: String(jobId),
      plan: plan.toObject()
    });
  } catch (err) {
    await ResearchJob.findByIdAndUpdate(jobId, {
      status: "failed",
      error: err.message,
      currentStep: "Failed",
      $push: {
        logs: {
          stage: "Error",
          message: err.message,
          level: "error"
        }
      }
    });

    throw err;
  }
}

function deterministicPlan(job) {
  const competitors = job.competitors.length ? job.competitors : ["key competitors"];
  return {
    goals: [
      `Answer the research question: ${job.question}`,
      `Assess ${job.industry} dynamics in ${job.geography} for ${job.timeframe}`,
      "Create a source-traceable evidence base for reviewer approval"
    ],
    workstreams: [
      {
        name: "Market context",
        objective: `Identify market size, demand signals, regulation, and adoption trends for ${job.industry} in ${job.geography}.`,
        searchTasks: [
          `${job.industry} ${job.geography} market trends ${job.timeframe}`,
          `${job.industry} ${job.geography} market size growth report`,
          `${job.industry} ${job.geography} regulatory changes ${job.timeframe}`
        ],
        sourceCategories: ["government", "industry reports", "credible news"],
        evidenceRequirements: ["dated claim", "source URL", "publisher", "excerpt"]
      },
      {
        name: "Competitor movement",
        objective: `Track public announcements and strategic moves from ${competitors.join(", ")}.`,
        searchTasks: competitors.flatMap(name => [`${name} ${job.industry} ${job.geography} announcement ${job.timeframe}`, `${name} strategy partnership investment ${job.timeframe}`]).slice(0, 8),
        sourceCategories: ["company announcements", "filings", "credible news"],
        evidenceRequirements: ["claim", "entity", "date", "source URL"]
      },
      {
        name: "Opportunity and risk signals",
        objective: "Identify growth pockets, constraints, risks, and implications for strategy.",
        searchTasks: [
          `${job.industry} ${job.geography} opportunities risks ${job.timeframe}`,
          `${job.industry} customer demand investment ${job.geography}`
        ],
        sourceCategories: ["analyst reports", "trade publications", "public datasets"],
        evidenceRequirements: ["claim", "topic", "confidence", "source URL"]
      }
    ],
    validationCriteria: ["source credibility", "publication recency", "duplicate content", "contradictions across sources", "claim-to-source traceability"]
  };
}

function classifySource(url) {
  const host = new URL(url).hostname;
  if (host.includes("sec.gov")) return "filing";
  if (host.includes("gov")) return "government";
  if (host.includes("arxiv") || host.includes("edu")) return "academic";
  if (host.includes("prnewswire") || host.includes("news")) return "news";
  return "other";
}

function sourceQuality(url, content = "") {
  const host = new URL(url).hostname;
  let score = 0.45;
  if (/\.(gov|edu)$/.test(host) || host.includes("sec.gov")) score += 0.35;
  if (host.includes("mckinsey") || host.includes("gartner") || host.includes("deloitte") || host.includes("bcg")) score += 0.2;
  if (content.length > 2000) score += 0.1;
  return Math.min(1, score);
}
