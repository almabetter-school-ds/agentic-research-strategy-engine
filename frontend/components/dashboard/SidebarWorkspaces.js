"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Database } from "lucide-react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { ConnectedSources } from "./ConnectedSources";
import { MarketTrendsChart } from "./MarketTrendsChart";
import { EmergingTrendsTable } from "./EmergingTrendsTable";
import { OpportunityMap } from "./OpportunityMap";
import { RecentReports } from "./RecentReports";

export function ResearchExplorerWorkspace() {
  const jobs = useResearchJobs();
  if (jobs.isLoading) return <Loading label="Loading research jobs..." />;
  if (jobs.error) return <ErrorMessage error={jobs.error} />;
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Active Research Jobs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {jobs.data?.length ? (
            jobs.data.map((job) => (
              <Link
                key={job._id}
                href={`/workflow-monitor?job=${job._id}`}
                className="rounded-lg border border-border p-4 transition hover:border-primary/50 hover:bg-muted/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{job.question}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {job.industry} - {job.geography} - {job.timeframe}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">
                    {job.status}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${job.progress || 0}%` }}
                  />
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              title="No research jobs"
              description="Create a new research workflow to explore live progress and evidence."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function MarketIntelligenceWorkspace() {
  const dashboard = useDashboard();
  const knowledge = useKnowledge();
  const activityVolume = mergeActivityVolume(
    dashboard.data?.charts?.volume || [],
    dashboard.data?.charts?.uploadVolume || [],
  );
  if (dashboard.isLoading || knowledge.isLoading)
    return <Loading label="Loading market intelligence..." />;
  if (dashboard.error || knowledge.error)
    return <ErrorMessage error={dashboard.error || knowledge.error} />;
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="xl:col-span-2">
        <MarketTrendsChart
          volume={activityVolume}
          evidenceCount={dashboard.data?.metrics?.evidenceRecords || 0}
          reportsCount={dashboard.data?.metrics?.reportsGenerated || 0}
        />
      </div>
      <EmergingTrendsTable
        industries={dashboard.data?.charts?.industries || []}
        knowledge={knowledge.data || []}
      />
      <OpportunityMap industries={dashboard.data?.charts?.industries || []} />
    </div>
  );
}

export function CompetitiveAnalysisWorkspace() {
  const dashboard = useDashboard();
  const knowledge = useKnowledge();
  const competitorRows = useMemo(
    () => [
      ...(dashboard.data?.charts?.competitors || []).map((item) => ({
        name: item._id,
        detail: `${item.count} research records`,
        source: "Research jobs",
      })),
      ...(knowledge.data || [])
        .filter((item) => item.collection === "competitor_insights")
        .map((item) => ({
          name: item.title,
          detail: `${Math.round((item.confidence || 0) * 100)}% confidence`,
          source: "Knowledge memory",
        })),
    ],
    [dashboard.data, knowledge.data],
  );
  if (dashboard.isLoading || knowledge.isLoading)
    return <Loading label="Loading competitor intelligence..." />;
  if (dashboard.error || knowledge.error)
    return <ErrorMessage error={dashboard.error || knowledge.error} />;
  return (
    <InsightList
      title="Competitor Signals"
      rows={competitorRows}
      empty="Competitor movements will appear after research jobs collect validated evidence."
    />
  );
}

export function ConsumerInsightsWorkspace() {
  const knowledge = useKnowledge();
  const rows = (knowledge.data || [])
    .filter((item) =>
      /consumer|customer|demand|user|buyer|adoption/i.test(
        `${item.title} ${item.content} ${item.tags?.join(" ")}`,
      ),
    )
    .map((item) => ({
      name: item.title,
      detail: `${Math.round((item.confidence || 0) * 100)}% confidence`,
      source: item.collection,
    }));
  if (knowledge.isLoading)
    return <Loading label="Loading consumer insights..." />;
  if (knowledge.error) return <ErrorMessage error={knowledge.error} />;
  return (
    <InsightList
      title="Consumer And Demand Signals"
      rows={rows}
      empty="Consumer insights will appear when validated research mentions customers, demand, buyers, or adoption."
    />
  );
}

export function StrategyBuilderWorkspace() {
  const reports = useReports();
  const rows = (reports.data || [])
    .flatMap((report) =>
      (report.sections || [])
        .filter((section) =>
          /recommend|strategy|opportun|risk|summary/i.test(section.title),
        )
        .map((section) => ({
          name: section.title,
          detail: section.body,
          source: report.title,
        })),
    )
    .slice(0, 10);
  if (reports.isLoading) return <Loading label="Loading strategy inputs..." />;
  if (reports.error) return <ErrorMessage error={reports.error} />;
  return (
    <InsightList
      title="Strategy Inputs From Reports"
      rows={rows}
      empty="Strategic recommendations will appear after reports are generated."
    />
  );
}

export function SWOTWorkspace() {
  const knowledge = useKnowledge();
  const groups = useMemo(
    () => buildSwot(knowledge.data || []),
    [knowledge.data],
  );
  if (knowledge.isLoading) return <Loading label="Loading SWOT evidence..." />;
  if (knowledge.error) return <ErrorMessage error={knowledge.error} />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Object.entries(groups).map(([title, rows]) => (
        <InsightList
          key={title}
          title={title}
          rows={rows}
          empty={`No ${title.toLowerCase()} evidence yet.`}
        />
      ))}
    </div>
  );
}

export function PortersWorkspace() {
  const knowledge = useKnowledge();
  const groups = useMemo(
    () => buildPorters(knowledge.data || []),
    [knowledge.data],
  );
  if (knowledge.isLoading)
    return <Loading label="Loading Five Forces evidence..." />;
  if (knowledge.error) return <ErrorMessage error={knowledge.error} />;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(groups).map(([title, rows]) => (
        <InsightList
          key={title}
          title={title}
          rows={rows}
          empty={`No ${title.toLowerCase()} evidence yet.`}
        />
      ))}
    </div>
  );
}

export function ForecastingWorkspace() {
  const dashboard = useDashboard();
  const activityVolume = mergeActivityVolume(
    dashboard.data?.charts?.volume || [],
    dashboard.data?.charts?.uploadVolume || [],
  );
  if (dashboard.isLoading)
    return <Loading label="Loading forecast signals..." />;
  if (dashboard.error) return <ErrorMessage error={dashboard.error} />;
  return (
    <MarketTrendsChart
      volume={activityVolume}
      evidenceCount={dashboard.data?.metrics?.evidenceRecords || 0}
      reportsCount={dashboard.data?.metrics?.reportsGenerated || 0}
    />
  );
}

export function SavedInsightsWorkspace() {
  const knowledge = useKnowledge();
  const rows = (knowledge.data || []).map((item) => ({
    name: item.title,
    detail: item.content,
    source: `${item.collection} - ${Math.round((item.confidence || 0) * 100)}% confidence`,
  }));
  if (knowledge.isLoading) return <Loading label="Loading saved insights..." />;
  if (knowledge.error) return <ErrorMessage error={knowledge.error} />;
  return (
    <InsightList
      title="Knowledge Base Insights"
      rows={rows}
      empty="Saved insights will appear when evidence is written to knowledge memory."
    />
  );
}

export function DataSourcesWorkspace() {
  const dashboard = useDashboard();
  const uploads = useUploads();
  if (dashboard.isLoading || uploads.isLoading)
    return <Loading label="Loading data sources..." />;
  if (dashboard.error || uploads.error)
    return <ErrorMessage error={dashboard.error || uploads.error} />;
  return (
    <div className="grid gap-4">
      <ConnectedSources sources={dashboard.data?.dataSources || []} />
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Sources</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {uploads.data?.length ? (
            uploads.data.map((file) => (
              <div
                key={file._id}
                className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Database size={18} className="text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file.mimeType} - {file.status}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No uploaded sources"
              description="Uploaded source files will appear here."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InsightList({ title, rows, empty }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.length ? (
          rows.slice(0, 10).map((row, index) => (
            <div
              key={`${row.name}-${index}`}
              className="rounded-lg border border-border p-3">
              <p className="font-medium">{row.name}</p>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {row.detail}
              </p>
              {row.source && (
                <p className="mt-2 text-xs text-primary">{row.source}</p>
              )}
            </div>
          ))
        ) : (
          <EmptyState title="No data yet" description={empty} />
        )}
      </CardContent>
    </Card>
  );
}

function Loading({ label }) {
  return <p className="text-sm text-muted-foreground">{label}</p>;
}

function ErrorMessage({ error }) {
  return (
    <Card>
      <CardContent className="p-4 text-sm text-red-300">
        {error.message}
      </CardContent>
    </Card>
  );
}

function useResearchJobs() {
  return useQuery({
    queryKey: ["workspace-research-jobs"],
    queryFn: async () => (await api.get("/research-jobs")).data.jobs,
  });
}

function useDashboard() {
  return useQuery({
    queryKey: ["workspace-dashboard"],
    queryFn: async () => (await api.get("/dashboard")).data,
  });
}

function useKnowledge() {
  return useQuery({
    queryKey: ["workspace-knowledge"],
    queryFn: async () => (await api.get("/knowledge")).data.results,
  });
}

function useReports() {
  return useQuery({
    queryKey: ["workspace-reports"],
    queryFn: async () => (await api.get("/reports")).data.reports,
  });
}

function useUploads() {
  return useQuery({
    queryKey: ["workspace-uploads"],
    queryFn: async () => (await api.get("/uploads")).data.files,
  });
}

function mergeActivityVolume(jobs = [], uploads = []) {
  const byDate = new Map();
  jobs.forEach((item) =>
    byDate.set(item._id, { _id: item._id, jobs: item.jobs || 0, uploads: 0 }),
  );
  uploads.forEach((item) => {
    const current = byDate.get(item._id) || {
      _id: item._id,
      jobs: 0,
      uploads: 0,
    };
    byDate.set(item._id, { ...current, uploads: item.uploads || 0 });
  });
  return Array.from(byDate.values()).sort((a, b) => a._id.localeCompare(b._id));
}

function buildSwot(items) {
  return {
    Strengths: matchItems(
      items,
      /strength|leader|advantage|capabil|growth|high confidence/i,
    ),
    Weaknesses: matchItems(
      items,
      /weakness|decline|gap|low|challenge|margin pressure/i,
    ),
    Opportunities: matchItems(
      items,
      /opportun|expand|demand|adoption|investment|partnership/i,
    ),
    Threats: matchItems(
      items,
      /threat|risk|competition|regulat|substitute|pressure/i,
    ),
  };
}

function buildPorters(items) {
  return {
    Rivalry: matchItems(
      items,
      /compet|rival|market share|pricing|differentiation/i,
    ),
    "Buyer Power": matchItems(
      items,
      /customer|buyer|client|demand|procurement/i,
    ),
    "Supplier Power": matchItems(
      items,
      /supplier|vendor|partner|input|dependency/i,
    ),
    Substitutes: matchItems(
      items,
      /substitute|alternative|replace|automation|platform/i,
    ),
    "Entry Threat": matchItems(
      items,
      /entry|new entrant|barrier|regulation|capital/i,
    ),
  };
}

function matchItems(items, pattern) {
  return items
    .filter((item) =>
      pattern.test(`${item.title} ${item.content} ${item.tags?.join(" ")}`),
    )
    .map((item) => ({
      name: item.title,
      detail: item.content,
      source: `${item.collection} - ${Math.round((item.confidence || 0) * 100)}% confidence`,
    }));
}
