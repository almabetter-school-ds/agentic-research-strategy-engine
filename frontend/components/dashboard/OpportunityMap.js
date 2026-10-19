"use client";

import { Scatter, ScatterChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../ui/empty-state";

export function OpportunityMap({ industries = [] }) {
  const router = useRouter();
  const data = industries.map(item => ({ name: item._id, records: item.count || 0, size: Math.max(120, (item.count || 0) * 120) }));
  return (
    <Card>
      <CardHeader><CardTitle>Market Opportunity Map</CardTitle></CardHeader>
      <CardContent className="h-72">
        {data.length ? <ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 8 }}><CartesianGrid stroke="rgba(148,163,184,0.15)" /><XAxis type="number" dataKey="records" name="Research Records" tick={{ fill: "#94a3b8", fontSize: 11 }} /><YAxis type="number" dataKey="records" name="Research Records" tick={{ fill: "#94a3b8", fontSize: 11 }} /><ZAxis dataKey="size" range={[120, 700]} /><Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#0b1529", border: "1px solid rgba(148,163,184,0.25)", borderRadius: 10 }} /><Scatter data={data} fill="#3b82f6" onClick={point => router.push(`/market-intelligence?market=${encodeURIComponent(point.name)}`)} /></ScatterChart></ResponsiveContainer> : <EmptyState title="No opportunity map data" description="Create research jobs to populate the opportunity map." />}
      </CardContent>
    </Card>
  );
}
