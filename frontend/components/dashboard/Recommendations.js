"use client";

import { asArray } from "./analysisUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function Recommendations({ data }) {
  return <Card><CardHeader><CardTitle>Recommendations</CardTitle></CardHeader><CardContent><ul className="grid gap-2 text-sm text-muted-foreground">{asArray(data.recommendations).map((item, i) => <li key={i}>• {item}</li>)}</ul></CardContent></Card>;
}
