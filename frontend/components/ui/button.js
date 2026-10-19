"use client";

import { cn } from "../../lib/utils";

export function Button({ className, variant = "primary", ...props }) {
  const variants = {
    primary: "bg-gradient-to-r from-primary to-accent-blue text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:brightness-110",
    secondary: "border border-border/80 bg-card/90 text-foreground shadow-sm shadow-slate-900/5 hover:border-primary/45 hover:bg-muted/90 dark:bg-elevated/80 dark:shadow-black/10",
    ghost: "text-foreground hover:bg-muted/80 hover:text-foreground dark:hover:text-white",
    danger: "bg-red-600 text-white shadow-lg shadow-red-950/30 hover:bg-red-700"
  };
  return <button className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50", variants[variant], className)} {...props} />;
}
