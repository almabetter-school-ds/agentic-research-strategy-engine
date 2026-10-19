"use client";

import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { formatNumber } from "../../lib/utils";

export function MetricCard({ title, value, change, comparison, icon: Icon, color = "#3b82f6", data = [], loading, error }) {
  if (loading) return <Card><CardContent className="p-4"><Skeleton className="h-24" /></CardContent></Card>;
  if (error) return <Card><CardContent className="p-4 text-sm text-red-300">{error.message}</CardContent></Card>;
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/55 hover:bg-card hover:shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
      <CardContent className="relative p-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-white/10 p-3 shadow-lg shadow-black/10 transition duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(99,102,241,0.25)]" style={{ backgroundColor: `${color}22`, color }}>
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-5 text-muted-foreground">{title}</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <p className="text-2xl font-semibold leading-none">{formatNumber(value)}</p>
              {change !== undefined && <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">{change}%</span>}
            </div>
            {comparison && <p className="mt-2 text-xs leading-5 text-muted-foreground">{comparison}</p>}
          </div>
        </div>
        <div className="mt-3 h-8 opacity-75 transition group-hover:opacity-100">
          {data.length ? <Sparkline data={data} color={color} /> : <div className="h-full rounded-md bg-muted/60" />}
        </div>
      </CardContent>
    </Card>
  );
}

function Sparkline({ data, color }) {
  const values = data.map(item => Number(item.value) || 0);
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? 100 / (values.length - 1) : 100;
  const points = values.map((value, index) => `${index * step},${32 - (value / max) * 28 - 2}`).join(" ");
  const area = `0,32 ${points} 100,32`;

  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
      <polyline points={area} fill={color} opacity="0.14" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
