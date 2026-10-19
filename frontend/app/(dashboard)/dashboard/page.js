"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Database, FileText, SlidersHorizontal, TrendingUp, Users, Zap } from "lucide-react";
import { useSelector } from "react-redux";
import { api } from "../../../lib/api";
import { roleLabel } from "../../../lib/roles";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Select } from "../../../components/ui/input";
import { FloatingMenu } from "../../../components/ui/menu";
import { Skeleton } from "../../../components/ui/skeleton";
import { MetricCard } from "../../../components/dashboard/MetricCard";

const MarketTrendsChart = dynamic(() => import("../../../components/dashboard/MarketTrendsChart").then(mod => mod.MarketTrendsChart), { ssr: false, loading: () => <Skeleton className="h-96" /> });
const EmergingTrendsTable = dynamic(() => import("../../../components/dashboard/EmergingTrendsTable").then(mod => mod.EmergingTrendsTable), { ssr: false, loading: () => <Skeleton className="h-80" /> });
const OpportunityMap = dynamic(() => import("../../../components/dashboard/OpportunityMap").then(mod => mod.OpportunityMap), { ssr: false, loading: () => <Skeleton className="h-80" /> });
const RecentReports = dynamic(() => import("../../../components/dashboard/RecentReports").then(mod => mod.RecentReports), { ssr: false, loading: () => <Skeleton className="h-80" /> });
const SentimentGauge = dynamic(() => import("../../../components/dashboard/SentimentGauge").then(mod => mod.SentimentGauge), { ssr: false, loading: () => <Skeleton className="h-80" /> });
const AnalysisDashboard = dynamic(() => import("../../../components/dashboard/AnalysisDashboard").then(mod => mod.AnalysisDashboard), { ssr: false, loading: () => <DashboardSkeleton /> });

const defaultSections = ["trends", "opportunity", "reports", "sentiment"];

export default function DashboardPage() {
  const user = useSelector(state => state.auth.user);
  const analysisState = useSelector(state => state.analysis);
  const [dateRange, setDateRange] = useState("30");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [sections, setSections] = useState(() => {
    const saved = JSON.parse(typeof window !== "undefined" ? localStorage.getItem("dashboardSections") || "null" : "null");
    return (saved || defaultSections).filter(section => defaultSections.includes(section));
  });
  const dashboard = useQuery({
    queryKey: ["dashboard", dateRange],
    queryFn: async () => (await api.get("/dashboard", { params: { days: dateRange } })).data,
    placeholderData: previous => previous || { metrics: {}, charts: {} }
  });
  const reports = useQuery({
    queryKey: ["dashboard-reports"],
    enabled: sections.includes("reports"),
    queryFn: async () => (await api.get("/reports")).data.reports,
    placeholderData: []
  });
  const uploads = useQuery({
    queryKey: ["uploads"],
    enabled: sections.includes("reports"),
    queryFn: async () => (await api.get("/uploads")).data.files,
    placeholderData: []
  });
  const knowledge = useQuery({
    queryKey: ["dashboard-knowledge"],
    enabled: sections.includes("trends"),
    queryFn: async () => (await api.get("/knowledge")).data.results,
    placeholderData: []
  });

  const activityVolume = useMemo(() => mergeActivityVolume(dashboard.data?.charts?.volume || [], dashboard.data?.charts?.uploadVolume || []), [dashboard.data]);
  const metricSpark = useMemo(() => sparkFromVolume(activityVolume), [activityVolume]);
  const processedUploadRate = useMemo(() => {
    const uploaded = dashboard.data?.metrics?.uploadedFiles || 0;
    const processed = dashboard.data?.metrics?.processedUploads || 0;
    return uploaded ? Math.round((processed / uploaded) * 100) : 0;
  }, [dashboard.data]);

  function updateSections(next) {
    setSections(next);
    localStorage.setItem("dashboardSections", JSON.stringify(next));
  }

  if (dashboard.error) return <Card><CardContent className="p-6 text-red-300">{dashboard.error.message}</CardContent></Card>;

  const metrics = dashboard.data?.metrics || {};
  const charts = dashboard.data?.charts || {};
  const uploadExtractionLabel = `${metrics.processedUploads || 0} processed from ${metrics.uploadedFiles || 0} uploads`;
  const roleContext = getRoleContext(user?.role);

  if (analysisState.dashboardData || analysisState.loading || analysisState.error) {
    return <AnalysisDashboard data={analysisState.dashboardData} query={analysisState.query} generatedAt={analysisState.generatedAt} loading={analysisState.loading} error={analysisState.error} />;
  }

  return (
    <div className="grid animate-page-in gap-4 sm:gap-5">
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-border/80 bg-card/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-950/[0.02] backdrop-blur dark:bg-card/70 dark:shadow-black/15 dark:ring-white/[0.03] sm:p-5 md:flex-row md:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">{roleLabel(user?.role)} workspace</p>
          <h1 className="text-2xl font-semibold">{roleContext.title}, {user?.name || "Consultant"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{roleContext.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground"><Calendar size={16} /><Select className="h-8 border-0 bg-transparent p-0 focus:ring-0" value={dateRange} onChange={e => setDateRange(e.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></Select></label>
          <div className="relative">
            <Button variant="secondary" onClick={() => setCustomizeOpen(!customizeOpen)}><SlidersHorizontal size={16} />Customize</Button>
            <FloatingMenu open={customizeOpen} onClose={() => setCustomizeOpen(false)} className="right-0 top-12 w-64">
              <p className="px-2 py-1 text-sm font-semibold">Dashboard sections</p>
              {defaultSections.map(section => <label key={section} className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"><input type="checkbox" checked={sections.includes(section)} onChange={e => updateSections(e.target.checked ? [...sections, section] : sections.filter(x => x !== section))} />{label(section)}</label>)}
              <button className="mt-2 w-full rounded-md px-2 py-2 text-sm text-primary hover:bg-muted" onClick={() => updateSections(defaultSections)}>Reset layout</button>
            </FloatingMenu>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Market Opportunities" value={metrics.marketOpportunities || 0} icon={TrendingUp} color="#2563eb" data={metricSpark} loading={dashboard.isLoading} />
        <MetricCard title="Emerging Trends" value={metrics.emergingTrends || 0} icon={Zap} color="#8b5cf6" data={metricSpark} loading={dashboard.isLoading} />
        <MetricCard title="Competitors Monitored" value={metrics.competitorsMonitored || 0} icon={Users} color="#22c55e" data={metricSpark} loading={dashboard.isLoading} />
        <MetricCard title="Reports Generated" value={metrics.reportsGenerated || 0} icon={FileText} color="#f59e0b" data={metricSpark} loading={dashboard.isLoading} />
        <MetricCard title="Uploaded Files" value={metrics.uploadedFiles || 0} change={metrics.uploadedFiles ? processedUploadRate : undefined} comparison={metrics.uploadedFiles ? uploadExtractionLabel : "No uploaded files yet"} icon={Database} color="#3b82f6" data={metricSpark} loading={dashboard.isLoading} />
      </section>

      {dashboard.isLoading ? <DashboardSkeleton /> : (
        <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          {sections.includes("trends") && <div className="xl:col-span-2"><MarketTrendsChart volume={activityVolume} evidenceCount={metrics.evidenceRecords || 0} reportsCount={metrics.reportsGenerated || 0} /></div>}
          {sections.includes("trends") && <EmergingTrendsTable industries={charts.industries || []} knowledge={knowledge.data || []} />}
          {sections.includes("opportunity") && <OpportunityMap industries={charts.industries || []} />}
          {sections.includes("reports") && <RecentReports reports={reports.data || []} uploads={uploads.data || []} />}
          {sections.includes("sentiment") && <SentimentGauge score={dashboard.data?.metrics?.sentimentScore ?? null} />}
        </section>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return <div className="grid gap-4 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>;
}

function sparkFromVolume(volume) {
  const data = volume.map(item => ({ value: (item.jobs || 0) + (item.uploads || 0) }));
  return data;
}

function mergeActivityVolume(jobs = [], uploads = []) {
  const byDate = new Map();
  jobs.forEach(item => byDate.set(item._id, { _id: item._id, jobs: item.jobs || 0, uploads: 0 }));
  uploads.forEach(item => {
    const current = byDate.get(item._id) || { _id: item._id, jobs: 0, uploads: 0 };
    byDate.set(item._id, { ...current, uploads: item.uploads || 0 });
  });
  return Array.from(byDate.values()).sort((a, b) => a._id.localeCompare(b._id));
}

function label(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getRoleContext(role) {
  if (role === "admin") {
    return {
      title: "System overview",
      description: "You are viewing global research activity, reports, files, and operational health."
    };
  }
  if (role === "reviewer") {
    return {
      title: "Review workspace",
      description: "Use the review queue to approve, reject, or flag evidence before insights become reusable."
    };
  }
  return {
    title: "Research workspace",
    description: "Create research, track your jobs, upload files, and generate strategy reports."
  };
}
