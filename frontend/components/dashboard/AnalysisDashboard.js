"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { KPICards } from "./KPICards";
import { MarketGrowthChart } from "./MarketGrowthChart";
import { MarketSharePieChart } from "./MarketSharePieChart";
import { RevenueForecast } from "./RevenueForecast";
import { RiskHeatMap } from "./RiskHeatMap";
import { SWOTChart } from "./SWOTChart";
import { CompetitorTable } from "./CompetitorTable";
import { CustomerSegmentChart } from "./CustomerSegmentChart";
import { TechnologyChart } from "./TechnologyChart";
import { PricingChart } from "./PricingChart";
import { FeatureComparison } from "./FeatureComparison";
import { InvestmentGauge } from "./InvestmentGauge";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { Recommendations } from "./Recommendations";
import { PorterFiveForces } from "./PorterFiveForces";
import { PESTLE } from "./PESTLE";
import { ForecastChart } from "./ForecastChart";
import { ExportButtons } from "./ExportButtons";
import { asArray } from "./analysisUtils";
import { Button } from "../ui/button";
import { ViewLatestAnalysisButton } from "./ViewLatestAnalysisButton";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function AnalysisDashboard({ data, query, generatedAt, loading, error, onRetry }) {
  if (loading) return <AnalysisSkeleton />;
  if (error) return <AnalysisError error={error} onRetry={onRetry} />;
  if (!data) return null;
  return (
    <section id="analysis-dashboard-print" className="grid animate-page-in gap-4 sm:gap-5 lg:gap-6">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-primary/25 bg-card/95 p-4 shadow-[0_18px_45px_rgba(79,70,229,0.10)] ring-1 ring-slate-950/[0.02] dark:bg-card/90 dark:ring-white/[0.03] sm:p-6 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary">DeepSeek Analysis Dashboard</p>
          <h1 className="mt-2 text-xl font-semibold leading-tight sm:text-2xl lg:text-3xl">{data.title || query || "Market Analysis"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Generated from DeepSeek API{generatedAt ? ` · ${new Date(generatedAt).toLocaleString()}` : ""}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
         <ViewLatestAnalysisButton />
         <ExportButtons data={data} pdfTargetId="analysis-dashboard-print" />
        </div>
      </div>

      <KPICards data={data} />
      <ExecutiveSummary data={data} />
      <section className="grid gap-4 xl:grid-cols-2">
        <MarketGrowthChart data={data} />
        <RevenueForecast data={data} />
        <MarketSharePieChart data={data} />
        <InvestmentGauge data={data} />
        <TechnologyChart data={data} />
        <CustomerSegmentChart data={data} />
        <PricingChart data={data} />
        <ForecastChart data={data} />
        <SWOTChart data={data} />
        <RiskHeatMap data={data} />
      </section>
      <CompetitorTable data={data} />
      <FeatureComparison data={data} />
      <InsightTables data={data} />
      <PorterFiveForces data={data} />
      <PESTLE data={data} />
      <Recommendations data={data} />
      <Card><CardHeader><CardTitle>Final AI Conclusion</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-muted-foreground">{data.finalConclusion || "No final conclusion returned by DeepSeek."}</p></CardContent></Card>
    </section>
  );
}

function InsightTables({ data }) {
  const groups = [
    ["Market Opportunities", data.opportunities],
    ["Industry Trends", data.trends],
    ["Risk Matrix", data.risks],
    ["Growth Drivers", data.growthDrivers],
    ["Challenges", data.challenges],
    ["Go To Market", data.goToMarket]
  ];
  return <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{groups.map(([title, items]) => <Card key={title}><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><ul className="grid gap-2 text-sm text-muted-foreground">{asArray(items).length ? asArray(items).map((item, index) => <li key={index}>• {item}</li>) : <li>No DeepSeek data returned.</li>}</ul></CardContent></Card>)}</section>;
}

function AnalysisSkeleton() {
  return <section className="grid gap-4"><Skeleton className="h-28" /><div className="grid gap-3 md:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-28" />)}</div><div className="grid gap-4 xl:grid-cols-2">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-80" />)}</div></section>;
}

function AnalysisError({ error, onRetry }) {
  return <Card><CardContent className="flex items-start justify-between gap-4 p-6"><div className="flex gap-3"><AlertTriangle className="text-danger" /><div><p className="font-semibold">DeepSeek analysis failed</p><p className="mt-1 text-sm text-muted-foreground">{error}</p></div></div>{onRetry && <Button variant="secondary" onClick={onRetry}><RefreshCw size={16} />Retry</Button>}</CardContent></Card>;
}
