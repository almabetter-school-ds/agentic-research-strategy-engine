"use client";

import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

const preferredSections = ["Executive Summary", "Key Findings", "Competitor Analysis", "Opportunities", "Risks", "Recommendations"];
const aliases = {
  "Market Signals": "Key Findings",
  "Industry Trends": "Key Findings",
  "Growth Opportunities": "Opportunities",
  "Strategic Recommendations": "Recommendations"
};

export default function ReportsPage() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ["reports"], queryFn: async () => (await api.get("/reports")).data.reports });
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading reports...</p>;
  if (error) return <p className="text-sm text-red-700">{error.message}</p>;
  return <div className="grid gap-6">{data.length ? data.map(report => <ReportDocument key={report._id} report={report} />) : <Card><CardContent className="p-4 text-sm text-muted-foreground">No reports generated yet.</CardContent></Card>}</div>;
}

function ReportDocument({ report }) {
  async function exportPdf() {
    const response = await api.get(`/reports/${report._id}/export/pdf`, { responseType: "blob" });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.title}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const sections = normalizeSections(report.sections || []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>{report.title}</CardTitle>
        <Button variant="secondary" onClick={exportPdf}><Download size={16} />Export PDF</Button>
      </CardHeader>
      <CardContent className="p-6">
        <article className="mx-auto max-w-4xl rounded-md bg-background p-6">
          {preferredSections.map(title => (
            <section key={title} className="mb-8 last:mb-0">
              <h2 className="mb-3 text-lg font-semibold">{title}</h2>
              <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{sections[title] || "No reviewed content is available for this section yet."}</p>
            </section>
          ))}
        </article>
      </CardContent>
    </Card>
  );
}

function normalizeSections(sections) {
  return sections.reduce((acc, section) => {
    const title = aliases[section.title] || section.title;
    if (preferredSections.includes(title)) acc[title] = acc[title] ? `${acc[title]}\n\n${section.body}` : section.body;
    return acc;
  }, {});
}
