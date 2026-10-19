"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../ui/empty-state";

export function NotificationsPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: async () => (await api.get("/notifications")).data });
  const markAll = useMutation({ mutationFn: () => api.patch("/notifications/read-all"), onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
  const notifications = data?.notifications || [];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Bell size={16} />Alerts & Notifications</CardTitle>
        <Button variant="ghost" className="px-2" onClick={() => markAll.mutate()} aria-label="Mark all notifications read"><CheckCheck size={16} /></Button>
      </CardHeader>
      <CardContent className="grid gap-2">
        {notifications.length ? notifications.slice(0, 3).map(item => <Link key={item._id} href={item.href || "/dashboard"} className="rounded-lg border border-border p-3 text-sm hover:bg-muted"><span className={!item.readAt ? "font-medium" : "text-muted-foreground"}>{item.message}</span><span className="block text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span></Link>) : <EmptyState title="No notifications" description="Workflow alerts will appear here." />}
        <Link href="/notifications" className="text-xs text-primary">View all notifications</Link>
      </CardContent>
    </Card>
  );
}
