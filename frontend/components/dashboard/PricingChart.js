"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { asArray } from "./analysisUtils";
import { ChartCard, EmptyChart } from "./MarketGrowthChart";

export function PricingChart({ data }) {
  const rows = asArray(data.pricingComparison);
  return <ChartCard title="Pricing Comparison">{rows.length ? <ResponsiveContainer width="100%" height={260}><BarChart data={rows}><CartesianGrid stroke="rgba(148,163,184,.16)" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="price" fill="#f59e0b" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyChart />}</ChartCard>;
}
