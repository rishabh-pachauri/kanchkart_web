"use client";

import { useActionState } from "react";
import type { Category, Collection } from "@prisma/client";
import { createProductAction } from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProductForm({
  categories,
  collections
}: {
  categories: Category[];
  collections: Collection[];
}) {
  const [state, action, pending] = useActionState(createProductAction, null);

  return (
    <form action={action} className="rounded-md border bg-white/80 p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="imageUrl">Primary image URL</Label>
          <Input id="imageUrl" name="imageUrl" placeholder="Cloudinary URL or /brand/drinkware.svg" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="categoryId">Category</Label>
          <select id="categoryId" name="categoryId" className="focus-ring h-11 rounded-md border bg-white/80 px-3 text-sm" required>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="collectionId">Collection</Label>
          <select id="collectionId" name="collectionId" className="focus-ring h-11 rounded-md border bg-white/80 px-3 text-sm">
            <option value="">None</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" min="0" step="0.01" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="compareAtPrice">Compare at price</Label>
          <Input id="compareAtPrice" name="compareAtPrice" type="number" min="0" step="0.01" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" min="0" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lowStockAt">Low stock alert</Label>
          <Input id="lowStockAt" name="lowStockAt" type="number" min="0" defaultValue="5" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gstPercent">GST %</Label>
          <Input id="gstPercent" name="gstPercent" type="number" min="0" max="28" defaultValue="18" required />
        </div>
        <div className="grid gap-3 rounded-md border bg-ivory p-4 text-sm">
          {["isActive", "isFeatured", "isBestSeller", "isNewArrival"].map((name) => (
            <label key={name} className="flex items-center gap-2">
              <input type="checkbox" name={name} defaultChecked={name === "isActive"} />
              {name.replace("is", "").replace(/([A-Z])/g, " $1")}
            </label>
          ))}
        </div>
        <div className="md:col-span-2 grid gap-2">
          <Label htmlFor="shortDescription">Short description</Label>
          <Input id="shortDescription" name="shortDescription" />
        </div>
        <div className="md:col-span-2 grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" required />
        </div>
      </div>
      {state?.error ? <p className="mt-4 text-sm text-destructive">{state.error}</p> : null}
      <Button className="mt-6" variant="gold" disabled={pending}>
        {pending ? "Saving..." : "Save product"}
      </Button>
    </form>
  );
}

