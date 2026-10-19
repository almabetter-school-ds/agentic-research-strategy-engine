"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "../ui/button";
import { FloatingMenu } from "../ui/menu";

export function NotificationsMenu({ open, onOpen, onClose }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: async () => (await api.get("/notifications")).data, refetchInterval: 30000 });
  const markAll = useMutation({ mutationFn: () => api.patch("/notifications/read-all"), onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
  const markOne = useMutation({ mutationFn: id => api.patch(`/notifications/${id}/read`), onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
  const unread = data?.unreadCount || 0;

  return (
    <div className="relative">
      <Button variant="ghost" onClick={open ? onClose : onOpen} aria-label="Notifications" className="relative px-3">
        <Bell size={17} />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 h-5 min-w-5 rounded-full bg-danger px-1 text-[10px] leading-5 text-white">{unread}</span>}
      </Button>
      <FloatingMenu open={open} onClose={onClose} className="right-0 top-12 w-80">
        <div className="flex items-center justify-between px-2 py-1">
          <p className="text-sm font-semibold">Alerts & Notifications</p>
          <button className="text-xs text-primary" onClick={() => markAll.mutate()}>Mark all read</button>
        </div>
        <div className="mt-2 grid gap-1">
          {(data?.notifications || []).length ? data.notifications.map(item => (
            <Link key={item._id} href={item.href || "/dashboard"} onClick={() => { if (!item.readAt) markOne.mutate(item._id); onClose(); }} className="rounded-md px-2 py-2 text-sm hover:bg-muted">
              <span className={!item.readAt ? "text-foreground" : "text-muted-foreground"}>{item.message}</span>
              <span className="block text-xs text-muted-foreground">{relativeTime(item.createdAt)}</span>
            </Link>
          )) : <p className="p-3 text-sm text-muted-foreground">No notifications yet.</p>}
        </div>
        <Link href="/notifications" className="mt-2 block rounded-md px-2 py-2 text-center text-xs text-primary hover:bg-muted" onClick={onClose}>View all notifications</Link>
      </FloatingMenu>
    </div>
  );
}

function relativeTime(date) {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
