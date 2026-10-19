"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Check, ExternalLink, Flag, ShieldCheck, X } from "lucide-react";
import { api } from "../../../lib/api";
import { isReviewerRole } from "../../../lib/roles";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/empty-state";

export default function EvidenceReviewPage() {
  const qc = useQueryClient();
  const user = useSelector(state => state.auth.user);
  const canReview = isReviewerRole(user?.role);
  const evidenceQuery = useQuery({
    queryKey: ["evidence-review-queue"],
    enabled: canReview,
    queryFn: async () => (await api.get("/evidence?limit=300")).data
  });
  const review = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/evidence/${id}/review`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evidence-review-queue"] })
  });
  const rows = evidenceQuery.data?.evidence || [];
  const summary = evidenceQuery.data?.summary || {};

  if (!canReview) {
    return (
      <Card>
        <CardHeader><CardTitle>Evidence Review</CardTitle></CardHeader>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Evidence decisions are available only to reviewer and admin accounts.
        </CardContent>
      </Card>
    );
  }

  if (evidenceQuery.isLoading) return <p className="text-sm text-muted-foreground">Loading evidence review queue...</p>;
  if (evidenceQuery.error) return <p className="text-sm text-red-300">{evidenceQuery.error.message}</p>;

  return (
    <div className="grid gap-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Evidence" value={rows.length} />
        <SummaryCard label="Pending" value={summary.pending || 0} tone="blue" />
        <SummaryCard label="Approved" value={summary.approved || 0} tone="green" />
        <SummaryCard label="Flagged / Rejected" value={(summary.flagged || 0) + (summary.rejected || 0)} tone="amber" />
      </section>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" />
            Evidence Review Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto p-0">
          {rows.length ? (
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>{["Claim & Context", "Source", "Confidence", "Status", "Actions"].map(h => <th key={h} className="border-b border-border p-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map(e => (
                  <tr key={e._id} className="border-b border-border/70 align-top transition hover:bg-muted/30">
                    <td className="max-w-[520px] p-4">
                      <p className="font-medium leading-6 text-foreground">{e.claim}</p>
                      {e.excerpt && <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{e.excerpt}</p>}
                      <p className="mt-3 text-xs text-primary/90">{formatJob(e.job)}</p>
                    </td>
                    <td className="p-4">
                      {e.source?.url ? (
                        <a className="inline-flex max-w-[260px] items-center gap-2 text-primary hover:underline" href={e.source.url} target="_blank" rel="noreferrer">
                          <span className="truncate">{e.source?.publisher || e.source?.title || "Source"}</span>
                          <ExternalLink size={14} className="shrink-0" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Source unavailable</span>
                      )}
                      {e.source?.sourceType && <p className="mt-2 text-xs capitalize text-muted-foreground">{e.source.sourceType}</p>}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {Math.round((e.confidence || 0) * 100)}%
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={e.validationStatus} />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Button className="h-9 px-3" variant="secondary" disabled={review.isPending} onClick={() => review.mutate({ id: e._id, status: "approved" })}>
                          <Check size={15} />Approve
                        </Button>
                        <Button className="h-9 px-3" variant="secondary" disabled={review.isPending} onClick={() => review.mutate({ id: e._id, status: "flagged" })}>
                          <Flag size={15} />Flag
                        </Button>
                        <Button className="h-9 px-3" variant="danger" disabled={review.isPending} onClick={() => review.mutate({ id: e._id, status: "rejected" })}>
                          <X size={15} />Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No evidence records yet"
                description="Run a research workflow from New Research. Extracted source-backed evidence will appear here for approval, flagging, or rejection."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, tone = "default" }) {
  const tones = {
    default: "text-foreground",
    blue: "text-primary",
    green: "text-emerald-300",
    amber: "text-amber-300"
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm shadow-black/10">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status = "pending" }) {
  const styles = {
    pending: "border-blue-400/30 bg-blue-500/10 text-blue-200",
    approved: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    flagged: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    rejected: "border-red-400/30 bg-red-500/10 text-red-200"
  };
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${styles[status] || styles.pending}`}>{status}</span>;
}

function formatJob(job) {
  if (!job) return "Research job context unavailable";
  return [job.industry, job.geography, job.status].filter(Boolean).join(" - ") || job.question || "Research job";
}
