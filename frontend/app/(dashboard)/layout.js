"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import AppShell from "../../components/AppShell";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, hydrated } = useSelector(state => state.auth);
  useEffect(() => {
    if (hydrated && !user) router.push("/login");
  }, [hydrated, user, router]);
  return <AppShell>{children}</AppShell>;
}
