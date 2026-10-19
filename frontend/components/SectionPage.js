"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function SectionPage({ title, description, children }) {
  return (
    <div className="grid gap-4">
      <section className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </section>
      <Card>
        <CardHeader><CardTitle>{title} Workspace</CardTitle></CardHeader>
        <CardContent>{children || <p className="text-sm text-muted-foreground">This workspace uses the existing research, report, evidence, and knowledge APIs. Create or open a research job to populate this section.</p>}</CardContent>
      </Card>
    </div>
  );
}
