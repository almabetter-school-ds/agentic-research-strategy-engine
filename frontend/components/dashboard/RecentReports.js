"use client";

import { Download, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";

export function RecentReports({ reports = [], uploads = [] }) {
  const router = useRouter();
  const uploadedReports = uploads
    .filter(file => file.mimeType === "application/pdf" || file.originalName?.toLowerCase().endsWith(".pdf"))
    .map(file => ({ ...file, kind: "upload", title: file.originalName, createdAt: file.createdAt }));
  const items = [
    ...reports.map(report => ({ ...report, kind: "report" })),
    ...uploadedReports
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  async function download(report, format = "pdf") {
    const response = await api.get(`/reports/${report._id}/export/${format}`, { responseType: "blob" });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.title}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Research Reports</CardTitle>
        <button className="text-xs text-primary" onClick={() => router.push("/reports")}>View all</button>
      </CardHeader>
      <CardContent className="grid gap-2">
        {items.length ? items.map(item => item.kind === "report" ? (
          <div key={item._id} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <FileText size={18} className="text-primary" />
            <button className="min-w-0 flex-1 text-left" onClick={() => router.push("/reports")}>
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()} - {item.sections?.length || 0} sections</p>
            </button>
            <Button variant="ghost" className="px-2" onClick={() => download(item, "pdf")} aria-label={`Download PDF ${item.title}`}><Download size={15} />PDF</Button>
            <Button variant="ghost" className="px-2" onClick={() => download(item, "md")} aria-label={`Export Markdown ${item.title}`}>MD</Button>
            <Button variant="ghost" className="px-2" onClick={() => download(item, "csv")} aria-label={`Export CSV ${item.title}`}>CSV</Button>
          </div>
        ) : (
          <div key={item._id} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <FileText size={18} className="text-primary" />
            <button className="min-w-0 flex-1 text-left" onClick={() => router.push("/data-sources")}>
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()} - Uploaded PDF - {item.status}</p>
            </button>
          </div>
        )) : <EmptyState title="No recent reports" description="Generated reports and uploaded PDFs will appear here." />}
      </CardContent>
    </Card>
  );
}
