"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select } from "../ui/input";
import { EmptyState } from "../ui/empty-state";

export function MarketTrendsChart({ volume = [], evidenceCount = 0, reportsCount = 0 }) {
  const [period, setPeriod] = useState("30");
  const data = volume.slice(-Number(period)).map(item => ({ date: item._id, score: (item.jobs || 0) + (item.uploads || 0), uploads: item.uploads || 0, jobs: item.jobs || 0 }));
  const score = data.reduce((sum, item) => sum + item.score, 0);
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">Market Trends Overview <Info size={14} className="text-muted-foreground" /></CardTitle>
        <Select className="w-36" value={period} onChange={e => setPeriod(e.target.value)}><option value="7">Last 7 Days</option><option value="30">Last 30 Days</option><option value="90">Last 90 Days</option></Select>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" /><XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} /><Tooltip contentStyle={{ background: "#0b1529", border: "1px solid rgba(148,163,184,0.25)", borderRadius: 10 }} /><Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#trendGradient)" strokeWidth={2} animationDuration={700} /></AreaChart></ResponsiveContainer> : <EmptyState title="No trend history" description="Research activity will appear once jobs are created." />}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <CompactMetric label="Activity Score" value={score} />
          <CompactMetric label="News Mentions" value={evidenceCount} />
          <CompactMetric label="Uploaded Files" value={data.reduce((sum, item) => sum + item.uploads, 0)} />
          <CompactMetric label="Reports" value={reportsCount} />
        </div>
      </CardContent>
    </Card>
  );
}

function CompactMetric({ label, value }) {
  return <div className="rounded-lg border border-border bg-elevated/60 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>;
}
