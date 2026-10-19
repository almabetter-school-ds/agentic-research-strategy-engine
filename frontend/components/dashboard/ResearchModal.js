"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { Button } from "../ui/button";
import { Input, Select, Textarea } from "../ui/input";
import { Modal } from "../ui/modal";

export function ResearchModal({ open, onClose }) {
  const router = useRouter();
  const [form, setForm] = useState({ industry: "", geography: "", objective: "", timeframe: "", competitors: "", dataSources: "Web research", depth: "Standard" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/research-jobs", {
        question: form.objective,
        industry: form.industry,
        geography: form.geography,
        timeframe: form.timeframe,
        competitors: form.competitors.split(",").map(x => x.trim()).filter(Boolean),
        outputType: "Market Entry Scan"
      }, { timeout: 120000 });
      onClose();
      router.push(`/workflow-monitor?job=${data.job._id}`);
    } catch (err) {
      setError(friendlyResearchError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Research">
      <form className="grid gap-4" onSubmit={submit}>
        {error && <p className="rounded-md border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm"><span>Market or industry</span><Input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} required /></label>
          <label className="grid gap-2 text-sm"><span>Geography</span><Input value={form.geography} onChange={e => setForm({ ...form, geography: e.target.value })} required /></label>
          <label className="grid gap-2 text-sm"><span>Time period</span><Input value={form.timeframe} onChange={e => setForm({ ...form, timeframe: e.target.value })} required /></label>
          <label className="grid gap-2 text-sm"><span>Competitors</span><Input value={form.competitors} onChange={e => setForm({ ...form, competitors: e.target.value })} placeholder="Comma separated" /></label>
          <label className="grid gap-2 text-sm"><span>Data sources</span><Select value={form.dataSources} onChange={e => setForm({ ...form, dataSources: e.target.value })}><option>Web research</option><option>Uploaded files</option><option>Web and uploaded files</option></Select></label>
          <label className="grid gap-2 text-sm"><span>Report depth</span><Select value={form.depth} onChange={e => setForm({ ...form, depth: e.target.value })}><option>Standard</option><option>Deep-dive</option><option>Board-ready</option></Select></label>
        </div>
        <label className="grid gap-2 text-sm"><span>Research objective</span><Textarea value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} required /></label>
        <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={loading}>{loading ? "Starting research..." : "Analyze"}</Button></div>
      </form>
    </Modal>
  );
}

function friendlyResearchError(error) {
  const message = error?.message || "Unable to start research";
  if (/timeout/i.test(message)) {
    return "Research is taking longer than expected. Please retry; this request now waits longer before timing out.";
  }
  return message;
}
