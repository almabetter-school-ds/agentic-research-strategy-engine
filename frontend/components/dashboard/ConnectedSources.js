"use client";

import { Database, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export function ConnectedSources({ sources = [] }) {
  const router = useRouter();
  return (
    <Card>
      <CardHeader><CardTitle>Connected Data Sources</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {sources.map(source => <button key={source.name} onClick={() => router.push("/settings")} className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition hover:border-primary/60 hover:bg-muted/60"><Database size={20} className={source.configured ? "text-success" : "text-muted-foreground"} /><span><span className="block text-sm font-medium">{source.name}</span><span className={source.configured ? "text-xs text-success" : "text-xs text-muted-foreground"}>{source.configured ? "Connected" : "Not configured"}</span></span></button>)}
        <Button variant="secondary" onClick={() => router.push("/settings")}><Plus size={16} />Add Source</Button>
      </CardContent>
    </Card>
  );
}
