"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  return (
    <form
      className="mt-4 flex gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus("loading");
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.get("email") })
        });
        setStatus(response.ok ? "success" : "error");
      }}
    >
      <Input
        name="email"
        type="email"
        placeholder="Email address"
        className="border-white/15 bg-white/10 text-ivory placeholder:text-ivory/45"
        required
      />
      <Button size="icon" variant="gold" aria-label="Subscribe" disabled={status === "loading"}>
        <Send className="h-4 w-4" />
      </Button>
      <span className="sr-only" aria-live="polite">
        {status}
      </span>
    </form>
  );
}

