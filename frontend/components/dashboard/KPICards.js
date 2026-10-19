"use client";

import { motion } from "framer-motion";
import { Activity, BarChart3, Gauge, ShieldAlert, TrendingUp, Users, Wallet, Zap } from "lucide-react";
import { asNumber } from "./analysisUtils";

export function KPICards({ data }) {
  const cards = [
    ["Overall Score", asNumber(data.overallScore), Gauge, "%"],
    ["Confidence", asNumber(data.confidence), Activity, "%"],
    ["Market Size", data.marketSize?.tam || "N/A", BarChart3, ""],
    ["Competition Score", asNumber(data.competitionScore), Users, "%"],
    ["Investment Score", asNumber(data.investmentScore), Wallet, "%"],
    ["Risk Score", asNumber(data.riskScore), ShieldAlert, "%"],
    ["Demand Score", asNumber(data.demandScore), Zap, "%"],
    ["CAGR", asNumber(data.cagr), TrendingUp, "%"]
  ];
  return <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon, suffix], index) => <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="rounded-xl border border-border/80 bg-card/95 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] ring-1 ring-slate-950/[0.02] transition duration-200 hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-[0_18px_44px_rgba(15,23,42,0.12)] dark:bg-card/90 dark:shadow-lg dark:shadow-black/20 dark:ring-white/[0.03]"><div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{label}</p><Icon size={18} className="shrink-0 text-primary" /></div><p className="mt-3 break-words text-2xl font-semibold leading-tight sm:text-3xl">{value}{typeof value === "number" ? suffix : ""}</p></motion.div>)}</section>;
}
