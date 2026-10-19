"use client";

import { asArray } from "./analysisUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function FeatureComparison({ data }) {
  const rows = asArray(data.featureComparison);
  return <Card><CardHeader><CardTitle>Feature Comparison</CardTitle></CardHeader><CardContent className="grid gap-2">{rows.length ? rows.map((row, index) => <div key={index} className="rounded-lg border border-border p-3"><p className="font-medium">{row.feature}</p><p className="mt-1 text-sm text-muted-foreground">Leaders: {asArray(row.leaders).join(", ") || "N/A"}</p><p className="text-sm text-muted-foreground">Laggards: {asArray(row.laggards).join(", ") || "N/A"}</p></div>) : <p className="text-sm text-muted-foreground">No feature comparison returned.</p>}</CardContent></Card>;
}
