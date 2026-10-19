"use client";

import { asArray } from "./analysisUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function CompetitorTable({ data }) {
  const rows = asArray(data.competitors);
  return <Card><CardHeader><CardTitle>Competitor Table</CardTitle></CardHeader><CardContent className="overflow-auto p-0"><table className="w-full min-w-[780px] text-left text-sm"><thead className="text-xs uppercase text-muted-foreground"><tr>{["Name","Share","Revenue","Employees","Strengths","Weaknesses"].map(h => <th key={h} className="border-b border-border p-4">{h}</th>)}</tr></thead><tbody>{rows.length ? rows.map((c, i) => <tr key={`${c.name}-${i}`} className="border-b border-border/70"><td className="p-4 font-medium">{c.name}</td><td className="p-4">{c.marketShare}%</td><td className="p-4">{c.revenue}</td><td className="p-4">{c.employees}</td><td className="p-4">{asArray(c.strengths).join(", ")}</td><td className="p-4">{asArray(c.weaknesses).join(", ")}</td></tr>) : <tr><td colSpan="6" className="p-6 text-muted-foreground">No competitors returned by DeepSeek.</td></tr>}</tbody></table></CardContent></Card>;
}
