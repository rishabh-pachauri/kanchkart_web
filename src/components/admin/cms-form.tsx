"use client";

import { useActionState } from "react";
import { upsertCmsSectionAction } from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CmsForm() {
  const [state, action, pending] = useActionState(upsertCmsSectionAction, null);

  return (
    <form action={action} className="rounded-md border bg-white/80 p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="key">Key</Label>
          <Input id="key" name="key" placeholder="home-hero" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="placement">Placement</Label>
          <select id="placement" name="placement" className="focus-ring h-11 rounded-md border bg-white px-3 text-sm">
            {[
              "HOME_HERO",
              "HOME_FEATURED_COLLECTIONS",
              "HOME_BEST_SELLERS",
              "HOME_TESTIMONIALS",
              "HOME_INSTAGRAM",
              "ABOUT",
              "CONTACT",
              "FOOTER",
              "FAQ",
              "POLICY",
              "PROMOTION"
            ].map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="eyebrow">Eyebrow</Label>
          <Input id="eyebrow" name="eyebrow" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" name="imageUrl" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="videoUrl">Video URL</Label>
          <Input id="videoUrl" name="videoUrl" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ctaLabel">CTA label</Label>
          <Input id="ctaLabel" name="ctaLabel" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ctaHref">CTA href</Label>
          <Input id="ctaHref" name="ctaHref" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" />
        </div>
        <label className="mt-8 flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked /> Active
        </label>
        <div className="md:col-span-2 grid gap-2">
          <Label htmlFor="body">Body</Label>
          <Textarea id="body" name="body" />
        </div>
      </div>
      {state?.error ? <p className="mt-4 text-sm text-destructive">{state.error}</p> : null}
      {state?.ok ? <p className="mt-4 text-sm text-emerald-700">Saved.</p> : null}
      <Button className="mt-6" variant="gold" disabled={pending}>
        {pending ? "Saving..." : "Save section"}
      </Button>
    </form>
  );
}

