"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { asArray } from "./analysisUtils";
import { ChartCard, EmptyChart } from "./MarketGrowthChart";

export function RevenueForecast({ data }) {
  const rows = asArray(data.forecast);
  return <ChartCard title="Revenue Forecast">{rows.length ? <ResponsiveContainer width="100%" height={260}><AreaChart data={rows}><CartesianGrid stroke="rgba(148,163,184,.16)" /><XAxis dataKey="year" /><YAxis /><Tooltip /><Area dataKey="value" stroke="#3b82f6" fill="#3b82f633" strokeWidth={3} /></AreaChart></ResponsiveContainer> : <EmptyChart />}</ChartCard>;
}
