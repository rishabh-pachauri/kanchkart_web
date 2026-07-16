import { cn } from "@/lib/utils";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-gold/40 bg-gold/10 px-2 py-1 text-xs font-semibold uppercase tracking-normal text-charcoal",
        className
      )}
    >
      {children}
    </span>
  );
}

