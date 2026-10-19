"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { asArray } from "./analysisUtils";
import { ChartCard, EmptyChart } from "./MarketGrowthChart";

const colors = ["#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444"];

export function CustomerSegmentChart({ data }) {
  const rows = asArray(data.customerSegments);
  return <ChartCard title="Customer Segments">{rows.length ? <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={rows} dataKey="value" nameKey="name" innerRadius={50} outerRadius={92}>{rows.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer> : <EmptyChart />}</ChartCard>;
}
