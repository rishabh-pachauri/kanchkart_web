"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";

export function useCartSession() {
  const { status, update } = useSession();
  const busy = useRef(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requireSession(): Promise<boolean | null> {
    if (busy.current || status === "loading") return null;
    busy.current = true;
    setChecking(true);
    setError(null);
    try {
      // Refresh from the cookie before redirecting, including after server-action login.
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Session unavailable");
      const session = await response.json();
      if (session !== null && (typeof session !== "object" || Array.isArray(session)))
        throw new Error("Invalid session");
      const authenticated = Boolean(session?.user?.id);
      if (authenticated && status !== "authenticated") await update();
      return authenticated;
    } catch {
      setError("Unable to check your session. Please try again.");
      return null;
    } finally {
      busy.current = false;
      setChecking(false);
    }
  }

  return { ready: status !== "loading", checking, error, requireSession };
}
