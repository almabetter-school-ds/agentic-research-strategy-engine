"use client";

import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export default function SettingsPage() {
  const user = useSelector(state => state.auth.user);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 text-sm md:max-w-2xl">
          <ProfileRow label="Name" value={user?.name || "User"} />
          <ProfileRow label="Email" value={user?.email || "Not available"} />
          <ProfileRow label="Role" value={user?.role || "consultant"} capitalize />
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileRow({ label, value, capitalize = false }) {
  return (
    <div className="grid gap-1 rounded-lg border border-border/70 bg-elevated/45 px-4 py-3 sm:grid-cols-[120px_1fr] sm:items-center">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`font-medium text-foreground ${capitalize ? "capitalize" : ""}`}>{value}</span>
    </div>
  );
}
