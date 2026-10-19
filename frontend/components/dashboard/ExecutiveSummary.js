"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function ExecutiveSummary({ data }) {
  return <Card><CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-muted-foreground">{data.executiveSummary || data.summary || "No executive summary returned by DeepSeek."}</p></CardContent></Card>;
}
