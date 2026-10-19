"use client";

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { asArray } from "./analysisUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function MarketGrowthChart({ data }) {
  const rows = asArray(data.marketGrowth);
  return <ChartCard title="Market Growth">{rows.length ? <ResponsiveContainer width="100%" height={260}><LineChart data={rows}><CartesianGrid stroke="rgba(148,163,184,.16)" /><XAxis dataKey="year" /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} /></LineChart></ResponsiveContainer> : <EmptyChart />}</ChartCard>;
}

export function ChartCard({ title, children }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>;
}

export function EmptyChart() {
  return <div className="grid h-64 place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">No chart data returned by DeepSeek.</div>;
}
