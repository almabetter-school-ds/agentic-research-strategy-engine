"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { asArray } from "./analysisUtils";
import { ChartCard } from "./MarketGrowthChart";

export function SWOTChart({ data }) {
  const swot = data.swot || {};
  const rows = ["strengths", "weaknesses", "opportunities", "threats"].map(key => ({ area: key, value: asArray(swot[key]).length * 25 || 10 }));
  return <ChartCard title="SWOT Radar"><ResponsiveContainer width="100%" height={260}><RadarChart data={rows}><PolarGrid /><PolarAngleAxis dataKey="area" /><Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} /></RadarChart></ResponsiveContainer></ChartCard>;
}
