"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export default function ResearchPlansPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["jobs"], queryFn: async () => (await api.get("/research-jobs")).data.jobs });
  const approve = useMutation({ mutationFn: id => api.post(`/research-jobs/${id}/approve-plan`), onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }) });
  const run = useMutation({ mutationFn: id => api.post(`/research-jobs/${id}/run`), onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }) });
  const regenerate = useMutation({ mutationFn: id => api.post("/research-plan", { jobId: id }), onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }) });
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading research plans...</p>;
  if (error) return <p className="text-sm text-red-700">{error.message}</p>;
  return <div className="grid gap-4">{data.length ? data.map(job => <PlanCard key={job._id} job={job} approve={approve} run={run} regenerate={regenerate} />) : <Card><CardContent><p className="text-sm text-muted-foreground">No research plans yet.</p></CardContent></Card>}</div>;
}

function PlanCard({ job, approve, run, regenerate }) {
  const { data } = useQuery({ queryKey: ["job", job._id], queryFn: async () => (await api.get(`/research-jobs/${job._id}`)).data });
  const plan = data?.plan;
  return (
    <Card>
      <CardHeader><CardTitle>{job.question}</CardTitle></CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-4"><span>{job.industry}</span><span>{job.geography}</span><span>{job.outputType}</span><span>{job.status}</span></div>
        {plan && <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Research Goals" items={plan.goals} />
          <Panel title="Workstreams" items={plan.workstreams?.map(w => `${w.name}: ${w.objective}`)} />
          <Panel title="Validation Criteria" items={plan.validationCriteria} />
        </div>}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => approve.mutate(job._id)} disabled={plan?.status === "approved"}>Approve Plan</Button>
          <Button variant="secondary" onClick={() => regenerate.mutate(job._id)}>Regenerate Plan</Button>
          <Button variant="secondary" onClick={() => run.mutate(job._id)} disabled={plan?.status !== "approved"}>Run Workflow</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Panel({ title, items = [] }) {
  return <div className="rounded-md border border-border p-4"><p className="mb-2 text-sm font-semibold">{title}</p><ul className="grid gap-2 text-sm text-muted-foreground">{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div>;
}
