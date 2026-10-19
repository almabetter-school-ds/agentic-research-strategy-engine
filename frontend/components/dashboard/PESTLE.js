"use client";

import { asArray } from "./analysisUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function PESTLE({ data }) {
  const pestle = data.pestle || {};
  return <Card><CardHeader><CardTitle>PESTLE</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">{Object.entries(pestle).map(([key, items]) => <div key={key} className="rounded-lg border border-border p-3"><p className="mb-2 font-medium capitalize">{key}</p><ul className="grid gap-1 text-sm text-muted-foreground">{asArray(items).map((item, i) => <li key={i}>• {item}</li>)}</ul></div>)}</CardContent></Card>;
}
