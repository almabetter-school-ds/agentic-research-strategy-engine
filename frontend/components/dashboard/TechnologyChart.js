"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { asArray } from "./analysisUtils";
import { ChartCard, EmptyChart } from "./MarketGrowthChart";

export function TechnologyChart({ data }) {
  const rows = asArray(data.technologyAdoption);
  return <ChartCard title="Technology Adoption">{rows.length ? <ResponsiveContainer width="100%" height={260}><BarChart data={rows}><CartesianGrid stroke="rgba(148,163,184,.16)" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyChart />}</ChartCard>;
}
