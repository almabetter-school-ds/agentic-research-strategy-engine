"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function PorterFiveForces({ data }) {
  const forces = data.porterFiveForces || {};
  return <Card><CardHeader><CardTitle>Porter&apos;s Five Forces</CardTitle></CardHeader><CardContent className="grid gap-2 md:grid-cols-5">{Object.entries(forces).map(([key, value]) => <div key={key} className="rounded-lg border border-border p-3"><p className="text-xs capitalize text-muted-foreground">{key.replaceAll(/([A-Z])/g, " $1")}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>)}</CardContent></Card>;
}
