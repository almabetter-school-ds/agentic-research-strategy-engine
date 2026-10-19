"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { api } from "../../../lib/api";
import { isReviewerRole } from "../../../lib/roles";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input, Select, Textarea } from "../../../components/ui/input";

export default function KnowledgeBasePage() {
  const qc = useQueryClient();
  const user = useSelector(state => state.auth.user);
  const canCreateKnowledge = isReviewerRole(user?.role);
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [draft, setDraft] = useState({ title: "", content: "", collection: "market_insights", tags: "" });
  const { data, isLoading, error } = useQuery({ queryKey: ["knowledge", submitted], queryFn: async () => (await api.get("/knowledge", { params: { q: submitted || undefined } })).data });
  const createKnowledge = useMutation({
    mutationFn: async () => api.post("/knowledge", {
      ...draft,
      tags: draft.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      confidence: 0.8
    }),
    onSuccess: () => {
      setDraft({ title: "", content: "", collection: "market_insights", tags: "" });
      qc.invalidateQueries({ queryKey: ["knowledge"] });
      qc.invalidateQueries({ queryKey: ["dashboard-knowledge"] });
    }
  });
  const rows = data?.results || [];
  return (
    <Card>
      <CardHeader><CardTitle>Knowledge Base</CardTitle></CardHeader>
      <CardContent className="grid gap-4 p-4">
        {canCreateKnowledge && (
          <form className="grid gap-3 rounded-lg border border-border bg-elevated/40 p-4" onSubmit={e => { e.preventDefault(); createKnowledge.mutate(); }}>
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <Input placeholder="Validated insight title" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} required />
              <Select value={draft.collection} onChange={e => setDraft({ ...draft, collection: e.target.value })}>
                <option value="market_insights">Market Insights</option>
                <option value="competitor_insights">Competitor Insights</option>
                <option value="trend_analysis">Trend Analysis</option>
                <option value="research_reports">Research Reports</option>
              </Select>
            </div>
            <Textarea placeholder="Write the validated finding" value={draft.content} onChange={e => setDraft({ ...draft, content: e.target.value })} required />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input placeholder="Tags, separated by commas" value={draft.tags} onChange={e => setDraft({ ...draft, tags: e.target.value })} />
              <Button className="shrink-0" disabled={createKnowledge.isPending}>{createKnowledge.isPending ? "Saving..." : "Add Insight"}</Button>
            </div>
            {createKnowledge.error && <p className="text-sm text-red-700">{createKnowledge.error.message}</p>}
          </form>
        )}
        <form className="flex gap-3" onSubmit={e => { e.preventDefault(); setSubmitted(q); }}>
          <Input placeholder="Search validated insights" value={q} onChange={e => setQ(e.target.value)} />
          <Button>Search</Button>
        </form>
        {error && <p className="text-sm text-red-700">{error.message}</p>}
        {isLoading ? <p className="text-sm text-muted-foreground">Searching knowledge base...</p> : (
          <div className="overflow-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground"><tr>{["Insight", "Category", "Source", "Date"].map(h => <th key={h} className="border-b border-border p-4">{h}</th>)}</tr></thead>
              <tbody>{rows.length ? rows.map(item => <tr key={item._id} className="border-b border-border/70">
                <td className="p-4">{item.title}</td>
                <td className="p-4 text-muted-foreground">{formatCategory(item.collection)}</td>
                <td className="p-4 text-muted-foreground">{item.tags?.[0] || item.industry || "Validated finding"}</td>
                <td className="p-4 text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</td>
              </tr>) : <tr><td className="p-6 text-muted-foreground" colSpan="4">No knowledge base entries found.</td></tr>}</tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatCategory(value = "") {
  return value.split("_").map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(" ");
}
