"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CleanProductsButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/clean-products?token=kanchkart-seed-2024");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to sync photos.");
      }

      setStatus(`Done! Cleaned ${data.deletedInactiveCount} inactive items & updated ${data.activeProductsCount} product listing photos.`);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleSync}
        disabled={loading}
        variant="outline"
        className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-bold rounded-xl gap-2"
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 text-amber-400" />
        )}
        <span>{loading ? "Syncing Photos..." : "Sync Photos & Clean Inactive"}</span>
      </Button>
      {status && (
        <p className="text-xs text-amber-300 flex items-center gap-1 font-medium bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          {status}
        </p>
      )}
    </div>
  );
}
