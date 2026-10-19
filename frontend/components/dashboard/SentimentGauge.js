"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../ui/empty-state";

export function SentimentGauge({ score = null }) {
  if (score === null || score === undefined) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Market Sentiment</CardTitle></CardHeader>
        <CardContent>
          <EmptyState title="No sentiment data" description="Validated sentiment data will appear here when available." />
        </CardContent>
      </Card>
    );
  }
  const normalized = Math.max(0, Math.min(100, Math.round(score)));
  const rotation = -90 + normalized * 1.8;
  const label = normalized >= 60 ? "Positive" : normalized >= 40 ? "Neutral" : "Negative";
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Market Sentiment</CardTitle></CardHeader>
      <CardContent className="grid place-items-center">
        <div className="relative h-36 w-56 overflow-hidden">
          <div className="absolute inset-x-4 top-8 h-28 rounded-t-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" />
          <div className="absolute inset-x-8 top-14 h-24 rounded-t-full bg-card" />
          <div className="absolute left-1/2 top-[92px] h-1 w-20 origin-left rounded-full bg-slate-300 transition-transform duration-700" style={{ transform: `rotate(${rotation}deg)` }} />
          <div className="absolute left-1/2 top-[88px] h-3 w-3 -translate-x-1/2 rounded-full bg-slate-200" />
        </div>
        <p className="text-lg font-semibold text-success">{label}</p>
        <p className="text-3xl font-semibold">{normalized}<span className="text-base text-muted-foreground">/100</span></p>
        <p className="mt-1 text-xs text-muted-foreground">Derived from stored research confidence</p>
      </CardContent>
    </Card>
  );
}
