"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BookOpen,
  CircleDollarSign,
  ClipboardCheck,
  Database,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  UserCircle,
  X,
} from "lucide-react";
import { clearUser } from "../redux/store";
import { cn } from "../lib/utils";
import { isAdminRole, isReviewerRole, roleLabel } from "../lib/roles";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";
import { GlobalSearch } from "./dashboard/GlobalSearch";

const ResearchModal = dynamic(() => import("./dashboard/ResearchModal").then(mod => mod.ResearchModal), {
  ssr: false
});

const UploadDataHub = dynamic(() => import("./dashboard/UploadDataHub").then(mod => mod.UploadDataHub), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-lg bg-muted/60" />
});

const mainNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Research Explorer", href: "/research-explorer", icon: Search },
  { label: "Workflow Monitor", href: "/workflow-monitor", icon: Gauge },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Data Sources", href: "/data-sources", icon: Database },
  { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen, reviewerOnly: true },
  { label: "Evidence Review", href: "/evidence-review", icon: ClipboardCheck, reviewerOnly: true },
  { label: "Operations", href: "/operations", icon: ShieldCheck, adminOnly: true },
  { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
];

export default function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme ? savedTheme === "dark" : document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch(clearUser());
    router.push("/login");
  }

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Sidebar
        collapsed={collapsed}
        pathname={pathname}
        user={user}
        logout={logout}
        closeDrawer={() => setDrawer(false)}
        drawer={drawer}
      />
      <main
        className={cn(
          "min-w-0 transition-[padding] duration-300",
          collapsed ? "lg:pl-[82px]" : "lg:pl-[292px]",
        )}>
        <header className="sticky top-0 z-30 border-b border-border/80 bg-background/86 px-3 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors duration-300 dark:shadow-[0_10px_35px_rgba(0,0,0,0.18)] sm:px-4 md:px-6">
          <div className="mx-auto flex max-w-[1540px] flex-wrap items-center gap-2 md:flex-nowrap md:gap-3">
            <Button
              variant="ghost"
              className="lg:hidden"
              onClick={() => setDrawer(true)}
              aria-label="Open menu">
              <Menu size={18} />
            </Button>
            <Button
              variant="ghost"
              className="hidden h-10 w-10 px-0 lg:inline-flex"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {collapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </Button>
            <GlobalSearch />
            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Button
                className="h-10 whitespace-nowrap px-3 md:px-4"
                onClick={() => setResearchOpen(true)}>
                <CircleDollarSign size={16} />
                <span className="hidden sm:inline">New Research</span>
              </Button>
              <Button
                variant="secondary"
                className="h-10 whitespace-nowrap px-3 md:px-4"
                onClick={() => setUploadOpen(true)}>
                <Upload size={16} />
                <span className="hidden sm:inline">Upload Files</span>
              </Button>
              <Button
                variant="ghost"
                className="h-10 w-10 px-0"
                onClick={toggleTheme}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                title={darkMode ? "Light mode" : "Dark mode"}>
                {darkMode ? <Sun size={17} /> : <Moon size={17} />}
              </Button>
              <Button
                variant="ghost"
                className="h-10 w-10 px-0"
                onClick={() => router.push("/ai-assistant")}
                aria-label="Help">
                <Sparkles size={17} />
              </Button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1540px] p-3 sm:p-4 md:p-6">{children}</div>
      </main>
      {researchOpen && (
        <ResearchModal
          open={researchOpen}
          onClose={() => setResearchOpen(false)}
        />
      )}
      {uploadOpen && (
        <Modal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          title="Upload Files">
          <UploadDataHub />
        </Modal>
      )}
    </div>
  );
}

function Sidebar({ collapsed, pathname, user, logout, drawer, closeDrawer }) {
  const visibleNav = mainNav.filter(item => {
    if (item.adminOnly) return isAdminRole(user?.role);
    if (item.reviewerOnly) return isReviewerRole(user?.role);
    return true;
  });
  const roleDescription = getRoleDescription(user?.role);

  return (
    <>
      {drawer && (
        <button
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeDrawer}
          aria-label="Close menu overlay"
        />
      )}
      <aside
        className={cn(
          "sidebar-scroll fixed inset-y-0 left-0 z-50 flex h-screen w-[292px] flex-col overflow-y-auto border-r border-border/80 bg-card/96 p-4 shadow-[20px_0_55px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-[width,transform,background-color] duration-300 dark:bg-[#071225]/96 dark:shadow-[20px_0_60px_rgba(0,0,0,0.26)] lg:translate-x-0",
          drawer ? "translate-x-0" : "-translate-x-full",
          collapsed && "lg:w-[82px]",
        )}>
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/45 bg-primary/10 text-primary shadow-lg shadow-primary/20">
            <Gauge size={22} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-lg font-semibold leading-tight">McKinsey:</p>
              <p className="text-sm leading-tight text-muted-foreground">
                AI Market Research &<br />
                Strategy Engine
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            className="ml-auto px-2 lg:hidden"
            onClick={closeDrawer}>
            <X size={16} />
          </Button>
        </div>
        <nav className="grid gap-1" aria-label="Main navigation">
          {visibleNav.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={pathname === item.href}
              collapsed={collapsed}
              onClick={closeDrawer}
            />
          ))}
        </nav>
        {!collapsed && (
          <div className="mt-4 rounded-lg border border-border/80 bg-elevated/50 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{roleLabel(user?.role)} workspace</p>
            <p className="mt-1 leading-5">{roleDescription}</p>
          </div>
        )}
        <div className="mt-auto grid gap-4 pt-4">
          <div
            className={cn(
              "rounded-xl border border-border/80 bg-elevated/70 p-3 shadow-lg shadow-slate-900/5 dark:bg-elevated/45 dark:shadow-black/10",
              collapsed && "p-2",
            )}>
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                onClick={closeDrawer}
                className="flex shrink-0 items-center justify-center rounded-full border border-emerald-500/45 bg-emerald-500/10 text-emerald-600 transition hover:border-emerald-400/70 hover:bg-emerald-500/15 dark:text-emerald-200"
                aria-label="User profile"
                title="User profile">
                <UserCircle size={collapsed ? 24 : 34} />
              </Link>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {roleLabel(user?.role || "consultant")}
                  </p>
                </div>
              )}
            </div>
            {collapsed ? (
              <div className="mt-3 grid gap-2">
                <Link
                  href="/settings"
                  onClick={closeDrawer}
                  className="flex h-9 w-full items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Settings"
                  title="Settings">
                  <Settings size={16} />
                </Link>
                <button
                  onClick={logout}
                  className="flex h-9 w-full items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Logout"
                  title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="mt-3 grid gap-1">
                <Link
                  href="/settings"
                  onClick={closeDrawer}
                  className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Settings className="mr-2 inline" size={15} />
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="rounded-md px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                  <LogOut className="mr-2 inline" size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({ item, active, collapsed, onClick, badge }) {
  const { label, href, icon: Icon } = item;
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={label}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-muted/80 hover:text-foreground hover:shadow-lg hover:shadow-slate-900/5 dark:hover:bg-white/[0.07] dark:hover:shadow-black/10",
        active &&
          "bg-gradient-to-r from-primary to-accent-blue text-white shadow-lg shadow-primary/25",
        collapsed && "justify-center px-2",
      )}>
      <Icon
        size={17}
        className="shrink-0 transition group-hover:translate-x-0.5"
      />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && badge && (
        <span className="ml-auto rounded-full bg-primary/25 px-2 py-0.5 text-[10px] text-primary">
          {badge}
        </span>
      )}
    </Link>
  );
}

function getRoleDescription(role) {
  if (role === "admin") return "Global access to operations, review queues, reports, and system-wide metrics.";
  if (role === "reviewer") return "Review evidence decisions and maintain validated research knowledge.";
  return "Create research, monitor your workflow, upload files, and work with your own reports.";
}
