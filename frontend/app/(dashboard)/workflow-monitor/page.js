"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

const stages = ["Research Query", "Planning Agent", "Browser Agent", "Extraction Agent", "Validation Agent", "Aggregation Agent", "Report Generation"];
const stageMap = { Intake: 0, Planning: 1, "Plan Approved": 1, Browsing: 2, Extraction: 3, Validation: 4, Aggregation: 5, "Report Generation": 6, Review: 6 };

export default function WorkflowMonitorPage() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ["jobs-monitor"], queryFn: async () => (await api.get("/research-jobs")).data.jobs, refetchInterval: 5000 });
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading workflows...</p>;
  if (error) return <p className="text-sm text-red-700">{error.message}</p>;
  return <div className="grid gap-6">{data.length ? data.map(job => <JobMonitor key={job._id} job={job} />) : <Card><CardContent className="p-4 text-sm text-muted-foreground">No active research workflows.</CardContent></Card>}</div>;
}

function JobMonitor({ job }) {
  const { data } = useQuery({ queryKey: ["monitor-job", job._id], queryFn: async () => (await api.get(`/research-jobs/${job._id}`)).data, refetchInterval: 5000 });
  const liveJob = data?.job || job;
  const current = stageMap[liveJob.currentStep] ?? 0;
  const logs = liveJob.logs || [];
  return (
    <Card>
      <CardHeader><CardTitle>{job.question}</CardTitle></CardHeader>
      <CardContent className="grid gap-6 p-4 lg:grid-cols-[360px_1fr]">
        <div className="grid gap-3">
          {stages.map((stage, index) => (
            <div key={stage} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full border text-center text-sm leading-8 ${index <= current ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground"}`}>{index + 1}</div>
                {index < stages.length - 1 && <div className="h-7 w-px bg-border" />}
              </div>
              <div className="pt-1">
                <p className={index <= current ? "font-medium" : "text-muted-foreground"}>{stage}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid content-start gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Status label="Current Stage" value={liveJob.currentStep} />
            <Status label="Progress" value={`${liveJob.progress || 0}%`} />
            <Status label="Runtime" value={liveJob.runtimeMs ? `${Math.round(liveJob.runtimeMs / 60000)}m` : "Active or pending"} />
          </div>
          {liveJob.error && <p className="rounded-md border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">{liveJob.error}</p>}
          <div className="max-h-72 overflow-auto rounded-md border border-border p-4">
            <p className="mb-3 text-sm font-medium">Agent Logs</p>
            {logs.length ? logs.map((log, i) => <p key={i} className="mb-2 text-xs text-muted-foreground"><span>{new Date(log.createdAt).toLocaleTimeString()}</span> · {log.stage}: {log.message}</p>) : <p className="text-sm text-muted-foreground">No agent logs recorded yet.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Status({ label, value }) {
  return <div className="rounded-md border border-border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-sm font-medium">{value}</p></div>;
}
