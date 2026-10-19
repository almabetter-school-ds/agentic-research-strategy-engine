import { cn } from "../../lib/utils";

export function Input(props) {
  return <input {...props} className={cn("h-11 w-full rounded-lg border border-border/80 bg-background/70 px-3 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/70 hover:border-border focus:border-primary/70 focus:bg-elevated/80 focus:ring-2 focus:ring-primary/25", props.className)} />;
}

export function Textarea(props) {
  return <textarea {...props} className={cn("min-h-28 w-full rounded-lg border border-border/80 bg-background/70 px-3 py-2 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/70 hover:border-border focus:border-primary/70 focus:bg-elevated/80 focus:ring-2 focus:ring-primary/25", props.className)} />;
}

export function Select({ children, ...props }) {
  return <select {...props} className={cn("h-11 w-full rounded-lg border border-border/80 bg-background/70 px-3 text-sm outline-none transition-all duration-200 hover:border-border focus:border-primary/70 focus:bg-elevated/80 focus:ring-2 focus:ring-primary/25", props.className)}>{children}</select>;
}
