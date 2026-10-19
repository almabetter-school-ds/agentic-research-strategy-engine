"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, MoreVertical, Trash2, Upload } from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../ui/empty-state";

const accept = ".pdf,.docx,.xlsx,.csv,.ppt,.pptx";

export function UploadDataHub({ compact = false }) {
  const inputRef = useRef(null);
  const qc = useQueryClient();
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const uploads = useQuery({ queryKey: ["uploads"], queryFn: async () => (await api.get("/uploads")).data.files });
  const upload = useMutation({
    mutationFn: async files => {
      const form = new FormData();
      Array.from(files).forEach(file => form.append("files", file));
      return api.post("/uploads", form, { headers: { "Content-Type": "multipart/form-data" }, onUploadProgress: e => setProgress(e.total ? Math.round((e.loaded / e.total) * 100) : 40) });
    },
    onSuccess: () => {
      setProgress(0);
      qc.invalidateQueries({ queryKey: ["uploads"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["dashboard-knowledge"] });
      qc.invalidateQueries({ queryKey: ["knowledge"] });
    }
  });
  const del = useMutation({ mutationFn: id => api.delete(`/uploads/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ["uploads"] }) });

  function submit(files) {
    if (files?.length) upload.mutate(files);
  }

  return (
    <Card className={compact ? "" : "h-full"}>
      <CardHeader><CardTitle className="flex items-center gap-2"><Upload size={16} />Upload & Data Hub</CardTitle></CardHeader>
      <CardContent className="grid gap-4">
        <div onDragEnter={() => setDragging(true)} onDragOver={e => e.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); submit(e.dataTransfer.files); }} className={`rounded-xl border border-dashed p-7 text-center shadow-inner shadow-black/10 transition-all duration-200 ${dragging ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border/90 bg-background/35 hover:border-primary/45 hover:bg-elevated/45"}`}>
          <Upload className="mx-auto mb-3 text-muted-foreground transition-colors" />
          <p className="text-sm font-medium">Drag & drop files here</p>
          <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, XLSX, CSV, PPT, PPTX up to 50MB</p>
          <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={e => submit(e.target.files)} />
          <Button className="mt-4" onClick={() => inputRef.current?.click()}>Choose Files</Button>
          {upload.isPending && <div className="mt-4 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} /></div>}
          {upload.error && <p className="mt-3 text-xs text-red-300">{upload.error.message}</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between"><p className="text-sm font-medium">Recent Uploads</p><button className="text-xs text-primary" onClick={() => qc.invalidateQueries({ queryKey: ["uploads"] })}>Refresh</button></div>
          <div className="grid gap-2">
            {uploads.isLoading && <p className="text-sm text-muted-foreground">Loading uploads...</p>}
            {!uploads.isLoading && !(uploads.data || []).length && <EmptyState title="No uploaded files" description="Upload research material to enrich analysis." />}
            {(uploads.data || []).slice(0, compact ? 4 : 10).map(file => (
              <div key={file._id} className="flex items-center gap-3 rounded-lg border border-border/80 bg-elevated/35 p-3 transition hover:border-primary/45 hover:bg-elevated/60 hover:shadow-lg hover:shadow-black/10">
                <FileText size={18} className="text-primary" />
                <button className="min-w-0 flex-1 text-left" onClick={() => window.location.assign("/data-sources")}>
                  <p className="truncate text-sm font-medium">{file.originalName}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)} · {new Date(file.createdAt).toLocaleDateString()} · {file.status}</p>
                </button>
                <Button variant="ghost" className="px-2" onClick={() => del.mutate(file._id)} aria-label={`Delete ${file.originalName}`}><Trash2 size={15} /></Button>
                <MoreVertical size={15} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}
