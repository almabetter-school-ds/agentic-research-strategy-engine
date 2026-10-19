"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { asNumber } from "./analysisUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const GAUGE = {
  cx: 160,
  cy: 148,
  radius: 108,
  stroke: 24
};

const ZONES = [
  {
    id: "weak",
    label: "Weak",
    range: "0-54",
    min: 0,
    max: 54,
    color: "red",
    className: "border-red-500/40 bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-300",
    activeClassName: "border-red-500 bg-red-500/18 text-red-700 shadow-[0_0_22px_rgba(239,68,68,0.16)] dark:border-red-300 dark:bg-red-500/24 dark:text-red-100 dark:shadow-[0_0_22px_rgba(239,68,68,0.22)]",
    description: "Weak investment signal. Improve demand proof, unit economics, and risk controls before scaling."
  },
  {
    id: "watch",
    label: "Watch",
    range: "55-74",
    min: 55,
    max: 74,
    color: "yellow",
    className: "border-yellow-500/45 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/18 dark:text-yellow-200",
    activeClassName: "border-yellow-500 bg-yellow-500/18 text-yellow-800 shadow-[0_0_22px_rgba(234,179,8,0.16)] dark:border-yellow-200 dark:bg-yellow-500/24 dark:text-yellow-50 dark:shadow-[0_0_22px_rgba(234,179,8,0.22)]",
    description: "Watch-list opportunity. Validate assumptions, monitor competitor pressure, and stage investment."
  },
  {
    id: "attractive",
    label: "Attractive",
    range: "75-100",
    min: 75,
    max: 100,
    color: "green",
    className: "border-green-500/40 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-300",
    activeClassName: "border-green-500 bg-green-500/18 text-green-800 shadow-[0_0_22px_rgba(34,197,94,0.16)] dark:border-green-200 dark:bg-green-500/24 dark:text-green-50 dark:shadow-[0_0_22px_rgba(34,197,94,0.24)]",
    description: "Attractive investment zone. Prioritize go-to-market tests, partnerships, and capital allocation."
  }
];

export function InvestmentGauge({ data }) {
  const score = investmentScore(data);
  const clampedScore = clamp(score);
  const needle = pointForScore(clampedScore, GAUGE.radius - 18);
  const rating = ratingForScore(clampedScore);
  const currentZone = zoneForScore(clampedScore);
  const [selectedZoneId, setSelectedZoneId] = useState(currentZone.id);
  const selectedZone = useMemo(() => ZONES.find(zone => zone.id === selectedZoneId) || currentZone, [selectedZoneId, currentZone]);
  const selectedStart = pointForScore(selectedZone.min, GAUGE.radius + 24);
  const selectedEnd = pointForScore(selectedZone.max, GAUGE.radius + 24);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Investment Gauge</CardTitle>
        <div className="rounded-lg border border-primary/25 bg-primary/10 p-2 text-primary">
          <TrendingUp size={18} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="relative mx-auto w-full max-w-[420px]">
          <svg viewBox="0 0 320 190" className="h-52 w-full overflow-visible" role="img" aria-label={`Investment score ${Math.round(clampedScore)} out of 100`}>
            <defs>
              <linearGradient id="investmentGaugeGradient" x1="40" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="42%" stopColor="#f59e0b" />
                <stop offset="68%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <filter id="investmentNeedleShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
              </filter>
            </defs>

            <path
              d={arcPath(0, 100)}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeLinecap="round"
              strokeWidth={GAUGE.stroke}
              opacity="0.7"
            />
            <path
              d={arcPath(0, 100)}
              fill="none"
              stroke="url(#investmentGaugeGradient)"
              strokeLinecap="round"
              strokeWidth={GAUGE.stroke}
            />
            <path
              d={arcPath(selectedZone.min, selectedZone.max)}
              fill="none"
              stroke={zoneStroke(selectedZone.color)}
              strokeLinecap="round"
              strokeWidth="9"
              opacity="0.95"
            />
            <circle cx={selectedStart.x} cy={selectedStart.y} r="4" fill={zoneStroke(selectedZone.color)} />
            <circle cx={selectedEnd.x} cy={selectedEnd.y} r="4" fill={zoneStroke(selectedZone.color)} />
            <path
              d={arcPath(0, clampedScore)}
              fill="none"
              stroke="rgba(255,255,255,0.52)"
              strokeLinecap="round"
              strokeWidth="5"
            />

            {[0, 25, 50, 75, 100].map(value => {
              const outer = pointForScore(value, GAUGE.radius + 2);
              const inner = pointForScore(value, GAUGE.radius - 16);
              return (
                <line
                  key={value}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="rgba(226,232,240,0.68)"
                  strokeWidth={value % 50 === 0 ? 3 : 2}
                  strokeLinecap="round"
                />
              );
            })}

            <line
              x1={GAUGE.cx}
              y1={GAUGE.cy}
              x2={needle.x}
              y2={needle.y}
              stroke="#f8fafc"
              strokeWidth="7"
              strokeLinecap="round"
              filter="url(#investmentNeedleShadow)"
              className="transition-all duration-700 ease-out"
            />
            <circle cx={GAUGE.cx} cy={GAUGE.cy} r="13" fill="#111827" stroke="#f8fafc" strokeWidth="5" />
            <circle cx={needle.x} cy={needle.y} r="5" fill="#f8fafc" />

            <text x="43" y="174" fill="hsl(var(--muted-foreground))" fontSize="13" fontWeight="600">0</text>
            <text x="150" y="33" fill="hsl(var(--muted-foreground))" fontSize="13" fontWeight="600">50</text>
            <text x="256" y="174" fill="hsl(var(--muted-foreground))" fontSize="13" fontWeight="600">100</text>
          </svg>

          <div className="pointer-events-none absolute inset-x-0 bottom-2 grid place-items-center">
            <div className="rounded-xl border border-border/80 bg-card/95 px-5 py-3 text-center shadow-xl shadow-slate-900/10 dark:shadow-black/30">
              <p className="text-4xl font-bold leading-none tracking-normal">
                {Math.round(clampedScore)}
                <span className="ml-1 text-base font-semibold text-muted-foreground">/100</span>
              </p>
              <p className={`mt-1 text-xs font-semibold uppercase tracking-wide ${rating.className}`}>{rating.label}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
          {ZONES.map(zone => {
            const active = zone.id === selectedZone.id;
            const current = zone.id === currentZone.id;
            return (
              <button
                key={zone.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedZoneId(zone.id)}
                className={`min-h-11 rounded-lg border px-2 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${zone.className} ${active ? zone.activeClassName : ""}`}
              >
                <span className="block text-sm font-semibold">{zone.label}</span>
                <span className="mt-0.5 block text-[10px] uppercase tracking-wide opacity-80">{zone.range}{current ? " current" : ""}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-border/70 bg-elevated/65 p-3 dark:bg-elevated/55">
          <div className="flex items-center justify-between gap-3">
            <p className={`text-sm font-semibold ${selectedZone.id === "weak" ? "text-red-600 dark:text-red-300" : selectedZone.id === "watch" ? "text-yellow-700 dark:text-yellow-200" : "text-green-700 dark:text-green-300"}`}>
              {selectedZone.label} Zone
            </p>
            <p className="text-xs font-medium text-muted-foreground">Current score: {Math.round(clampedScore)}/100</p>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{selectedZone.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function investmentScore(data = {}) {
  const direct = Number(data.investmentScore);
  if (Number.isFinite(direct)) return direct;

  const overall = asNumber(data.overallScore);
  const demand = asNumber(data.demandScore);
  const confidence = asNumber(data.confidence);
  const competition = asNumber(data.competitionScore);
  const risk = asNumber(data.riskScore);
  const growth = asNumber(data.cagr || data.growthRate);

  return overall * 0.28 + demand * 0.22 + confidence * 0.18 + (100 - risk) * 0.17 + (100 - competition) * 0.08 + clamp(growth * 3) * 0.07;
}

function ratingForScore(score) {
  const zone = zoneForScore(score);
  if (zone.id === "attractive") return { label: "Attractive", className: "text-green-700 dark:text-green-300" };
  if (zone.id === "watch") return { label: "Watch", className: "text-yellow-700 dark:text-yellow-200" };
  return { label: "Weak", className: "text-red-600 dark:text-red-300" };
}

function zoneForScore(score) {
  return ZONES.find(zone => score >= zone.min && score <= zone.max) || ZONES[0];
}

function zoneStroke(color) {
  if (color === "green") return "#22c55e";
  if (color === "yellow") return "#eab308";
  return "#ef4444";
}

function arcPath(startScore, endScore) {
  const start = pointForScore(startScore, GAUGE.radius);
  const end = pointForScore(endScore, GAUGE.radius);
  const largeArc = Math.abs(endScore - startScore) > 50 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${GAUGE.radius} ${GAUGE.radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function pointForScore(score, radius) {
  const angle = (180 - clamp(score) * 1.8) * (Math.PI / 180);
  return {
    x: GAUGE.cx + radius * Math.cos(angle),
    y: GAUGE.cy - radius * Math.sin(angle)
  };
}

function clamp(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, number));
}
