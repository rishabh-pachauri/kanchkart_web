"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintLabelButton() {
  return (
    <Button
      type="button"
      variant="gold"
      onClick={() => window.print()}
      className="gap-2 font-bold shadow-md"
    >
      <Printer className="h-4 w-4" />
      Print / Save PDF Label
    </Button>
  );
}
