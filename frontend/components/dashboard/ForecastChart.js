"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { asArray } from "./analysisUtils";
import { ChartCard, EmptyChart } from "./MarketGrowthChart";

export function ForecastChart({ data }) {
  const rows = asArray(data.forecast);
  return <ChartCard title="Forecast Graph">{rows.length ? <ResponsiveContainer width="100%" height={260}><BarChart data={rows}><CartesianGrid stroke="rgba(148,163,184,.16)" /><XAxis dataKey="year" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyChart />}</ChartCard>;
}
