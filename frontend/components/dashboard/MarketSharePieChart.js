"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { asArray, asNumber } from "./analysisUtils";
import { ChartCard, EmptyChart } from "./MarketGrowthChart";

const colors = ["#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6"];

export function MarketSharePieChart({ data }) {
  const rows = asArray(data.competitors).map(item => ({ name: item.name, value: asNumber(item.marketShare) })).filter(item => item.value > 0);
  return <ChartCard title="Competitor Share">{rows.length ? <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={rows} dataKey="value" nameKey="name" outerRadius={90}>{rows.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer> : <EmptyChart />}</ChartCard>;
}
