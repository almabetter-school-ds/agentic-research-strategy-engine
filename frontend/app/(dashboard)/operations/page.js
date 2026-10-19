"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, BarChart3, Clock } from "lucide-react";
import { useSelector } from "react-redux";
import { api } from "../../../lib/api";
import { isAdminRole } from "../../../lib/roles";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { MetricCard } from "../../../components/dashboard/MetricCard";

export default function OperationsPage() {
  const user = useSelector(state => state.auth.user);
  const canViewOperations = isAdminRole(user?.role);
  const { data, isLoading, error } = useQuery({
    queryKey: ["operations"],
    enabled: canViewOperations,
    queryFn: async () => (await api.get("/dashboard/operations")).data
  });

  if (!canViewOperations) {
    return (
      <Card>
        <CardHeader><CardTitle>Operations</CardTitle></CardHeader>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Operations metrics are available only to admin accounts.
        </CardContent>
      </Card>
    );
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading operations metrics...</p>;
  if (error) return <p className="text-sm text-red-700">{error.message}</p>;

  return (
    <div className="grid gap-4">
      <section className="rounded-xl border border-border/80 bg-card/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-card/70 dark:shadow-black/15">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Admin workspace</p>
        <h1 className="text-2xl font-semibold">Operations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Monitor global workflow health, validation issues, runtime, source quality, and research volume.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Jobs" value={data?.totalResearchJobs || 0} icon={BarChart3} color="#2563eb" loading={isLoading} />
        <MetricCard title="Failed Jobs" value={data?.failedJobs || 0} icon={AlertTriangle} color="#dc2626" loading={isLoading} />
        <MetricCard title="Validation Issues" value={data?.validationFailures || 0} icon={Activity} color="#f59e0b" loading={isLoading} />
        <MetricCard title="Avg Runtime" value={Math.round((data?.avgRuntimeMs || 0) / 60000)} comparison={formatRuntime(data?.avgRuntimeMs)} icon={Clock} color="#22c55e" loading={isLoading} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <OperationsTable title="Top Industries" rows={data?.topIndustries || []} labelKey="_id" valueKey="count" empty="No industry activity yet." />
        <OperationsTable title="Top Competitors" rows={data?.topCompetitors || []} labelKey="_id" valueKey="count" empty="No competitor activity yet." />
        <OperationsTable title="Source Quality" rows={data?.sourceQuality || []} labelKey="_id" valueKey="score" formatValue={value => `${Math.round((value || 0) * 100)}%`} empty="No source quality data yet." />
      </section>
    </div>
  );
}

function OperationsTable({ title, rows, labelKey, valueKey, formatValue = value => value, empty }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-left text-sm">
          <tbody>
            {rows.length ? rows.map((row, index) => (
              <tr key={`${row[labelKey] || "unknown"}-${index}`} className="border-b border-border/70 last:border-0">
                <td className="p-4 font-medium">{row[labelKey] || "Unknown"}</td>
                <td className="p-4 text-right text-muted-foreground">{formatValue(row[valueKey])}</td>
              </tr>
            )) : (
              <tr><td className="p-4 text-muted-foreground">{empty}</td></tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function formatRuntime(value) {
  if (!value) return "0m";
  return `${Math.round(value / 60000)}m`;
}
