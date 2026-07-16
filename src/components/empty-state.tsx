import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-md border bg-white/70 px-6 py-12 text-center">
      <PackageOpen className="mx-auto h-10 w-10 text-gold" />
      <h2 className="mt-4 font-serif text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{body}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-6">
          <a href={actionHref}>{actionLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}

