
"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { Sparkles } from "lucide-react";

export function ViewLatestAnalysisButton() {
  const analysisResult = useSelector(
    state => state.analysis.analysisResult
  );

  // Show the button when an analysis is available.
  if (!analysisResult) return null;

  return (
    <Link
      href="/analysis"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent-blue px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 ease-out hover:shadow-xl hover:shadow-primary/25 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98]"
    >
      <Sparkles size={16} />
      View Latest Analysis
    </Link>
  );
}
