import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("rounded-xl border border-border/80 bg-card/95 text-card-foreground shadow-[0_16px_44px_rgba(15,23,42,0.10)] ring-1 ring-slate-950/[0.03] backdrop-blur transition-all duration-200 dark:bg-card/88 dark:shadow-[0_18px_55px_rgba(0,0,0,0.22)] dark:ring-white/[0.03]", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("border-b border-border/75 px-4 py-3.5 sm:px-5 sm:py-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h2 className={cn("text-base font-semibold text-card-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-4 sm:p-5", className)} {...props} />;
}
