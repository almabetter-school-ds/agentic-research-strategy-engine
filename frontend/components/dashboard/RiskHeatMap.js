"use client";

import { asArray } from "./analysisUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function RiskHeatMap({ data }) {
  const rows = asArray(data.risks);
  return <Card><CardHeader><CardTitle>Risk Heatmap</CardTitle></CardHeader><CardContent className="grid gap-2">{rows.length ? rows.map((risk, index) => <div key={index} className="grid grid-cols-[1fr_120px] items-center gap-3 rounded-lg border border-border p-3"><p className="text-sm">{risk}</p><div className={`rounded-md px-2 py-1 text-center text-xs ${index < 2 ? "bg-red-500/20 text-red-200" : "bg-amber-500/20 text-amber-200"}`}>{index < 2 ? "High" : "Medium"}</div></div>) : <p className="text-sm text-muted-foreground">No risks returned by DeepSeek.</p>}</CardContent></Card>;
}
