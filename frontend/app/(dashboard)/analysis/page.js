
"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { Sparkles } from "lucide-react";

export default function AnalysisPage() {
  const { analysisResult, query, generatedAt } = useSelector(
    state => state.analysis
  );

  const analysis = analysisResult;

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles size={15} />
            DeepSeek Market Analysis
          </p>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {analysis?.title || "AI Market Analysis"}
          </h1>

          <p className="text-sm text-muted-foreground">
            Detailed market intelligence and strategic recommendations
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent-blue px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 ease-out hover:shadow-xl hover:shadow-primary/25 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98]"
        >
          <Sparkles size={16} />
          View Dashboard
        </Link>
      </header>

      {!analysis ? (
        <section className="rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
          <Sparkles className="mx-auto mb-4 text-primary" size={32} />

          <h2 className="text-lg font-semibold">
            No analysis available yet
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Return to the dashboard, enter a research question in the global
            search bar, and click Analyze to generate your market analysis.
          </p>

          <Link
            href="/dashboard"
            className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            Go to Dashboard
          </Link>
        </section>
      ) : (
        <>
          {query && (
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Research Question
              </p>

              <p className="text-sm leading-6">{query}</p>

              {generatedAt && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Generated {new Date(generatedAt).toLocaleString()}
                </p>
              )}
            </section>
          )}

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
            <h2 className="mb-3 text-lg font-semibold">
              Executive Summary
            </h2>

            <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {analysis.summary || "No summary returned."}
            </p>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnalysisList
              title="Market Signals"
              items={analysis.marketSignals}
            />

            <AnalysisList
              title="Opportunities"
              items={analysis.opportunities}
            />

            <AnalysisList
              title="Risks"
              items={analysis.risks}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-lg font-semibold">
                Competitor Movements
              </h2>

              <div className="space-y-4">
                {analysis.competitors?.length ? (
                  analysis.competitors.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="border-b border-border pb-3 last:border-0"
                    >
                      <h3 className="text-sm font-medium">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.movement}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No competitor movements returned.
                  </p>
                )}
              </div>
            </section>

            <AnalysisList
              title={`Strategic Recommendations · Confidence ${formatConfidence(analysis.confidence)}%`}
              items={analysis.recommendations}
            />
          </div>

          <AnalysisList
            title="Next Research Questions"
            items={analysis.nextResearchQuestions}
          />
        </>
      )}
    </main>
  );
}

function AnalysisList({ title, items = [] }) {
  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>

      {items?.length ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                {typeof item === "string" ? item : JSON.stringify(item)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          No data returned for this section.
        </p>
      )}
    </section>
  );
}

function formatConfidence(value) {
  const number = Number(value || 0);

  if (!Number.isFinite(number)) return 0;

  return Math.round(number > 1 ? number : number * 100);
}
