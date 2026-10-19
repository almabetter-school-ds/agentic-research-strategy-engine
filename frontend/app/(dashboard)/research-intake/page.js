"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input, Textarea } from "../../../components/ui/input";

export default function ResearchIntakePage() {
  const router = useRouter();
  const [form, setForm] = useState({ question: "", industry: "", geography: "", timeframe: "", competitors: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/research-jobs", {
        ...form,
        competitors: form.competitors.split(",").map(x => x.trim()).filter(Boolean),
        outputType: "Market Entry Scan"
      });
      router.push("/research-plans");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader><CardTitle>Research Intake</CardTitle></CardHeader>
      <CardContent className="p-4">
        <form className="grid gap-4" onSubmit={submit}>
          {error && <p className="rounded-md border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
          <label className="grid gap-2 text-sm">
            <span>Research Question</span>
            <Textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm"><span>Industry</span><Input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} required /></label>
            <label className="grid gap-2 text-sm"><span>Geography</span><Input value={form.geography} onChange={e => setForm({ ...form, geography: e.target.value })} required /></label>
            <label className="grid gap-2 text-sm"><span>Timeframe</span><Input value={form.timeframe} onChange={e => setForm({ ...form, timeframe: e.target.value })} required /></label>
            <label className="grid gap-2 text-sm"><span>Competitors</span><Input value={form.competitors} onChange={e => setForm({ ...form, competitors: e.target.value })} placeholder="Comma separated" /></label>
          </div>
          <div><Button disabled={loading}>{loading ? "Starting..." : "Start Research"}</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
