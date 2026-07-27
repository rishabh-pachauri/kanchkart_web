"use client";

import { useActionState } from "react";
import type { Category, Collection, Product, ProductMedia } from "@prisma/client";
import { createProductAction, updateProductAction } from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProductWithMedia = Product & {
  media?: ProductMedia[];
};

export function ProductForm({
  categories,
  collections,
  product
}: {
  categories: Category[];
  collections: Collection[];
  product?: ProductWithMedia | null;
}) {
  const isEditing = Boolean(product?.id);
  const actionFn = isEditing ? updateProductAction : createProductAction;
  const [state, action, pending] = useActionState(actionFn, null);

  const primaryImage = product?.media?.[0]?.url || "";

  return (
    <form action={action} className="rounded-md border bg-white/80 p-5 shadow-sm">
      {isEditing ? <input type="hidden" name="id" value={product!.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={product?.name || ""} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku || ""} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={product?.slug || ""} placeholder="Auto-generated if left blank" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="imageUrl">Primary image URL</Label>
          <Input id="imageUrl" name="imageUrl" defaultValue={primaryImage} placeholder="Cloudinary URL or /brand/drinkware.svg" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId || categories[0]?.id || ""}
            className="focus-ring h-11 rounded-md border bg-white/80 px-3 text-sm"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="collectionId">Collection</Label>
          <select
            id="collectionId"
            name="collectionId"
            defaultValue={product?.collectionId || ""}
            className="focus-ring h-11 rounded-md border bg-white/80 px-3 text-sm"
          >
            <option value="">None</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={product?.price ? Number(product.price) : ""} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="compareAtPrice">Compare at price (₹)</Label>
          <Input id="compareAtPrice" name="compareAtPrice" type="number" min="0" step="0.01" defaultValue={product?.compareAtPrice ? Number(product.compareAtPrice) : ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" min="0" defaultValue={product?.stock ?? ""} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lowStockAt">Low stock alert</Label>
          <Input id="lowStockAt" name="lowStockAt" type="number" min="0" defaultValue={product?.lowStockAt ?? 5} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gstPercent">GST %</Label>
          <Input id="gstPercent" name="gstPercent" type="number" min="0" max="28" defaultValue={product?.gstPercent ? Number(product.gstPercent) : 18} required />
        </div>
        <div className="grid gap-3 rounded-md border bg-ivory p-4 text-sm">
          {[
            { key: "isActive", label: "Active", defaultVal: product ? product.isActive : true },
            { key: "isFeatured", label: "Featured", defaultVal: product ? product.isFeatured : false },
            { key: "isBestSeller", label: "Best Seller", defaultVal: product ? product.isBestSeller : false },
            { key: "isNewArrival", label: "New Arrival", defaultVal: product ? product.isNewArrival : false }
          ].map(({ key, label, defaultVal }) => (
            <label key={key} className="flex items-center gap-2">
              <input type="checkbox" name={key} defaultChecked={defaultVal} />
              {label}
            </label>
          ))}
        </div>
        <div className="md:col-span-2 grid gap-2">
          <Label htmlFor="shortDescription">Short description</Label>
          <Input id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription || ""} />
        </div>
        <div className="md:col-span-2 grid gap-2">
          <Label htmlFor="description">Description (min 20 characters)</Label>
          <Textarea id="description" name="description" defaultValue={product?.description || ""} required />
        </div>
      </div>
      {state?.error ? (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200 font-medium">
          {state.error}
        </div>
      ) : null}
      <Button className="mt-6" variant="gold" disabled={pending}>
        {pending ? "Saving..." : isEditing ? "Update product" : "Save product"}
      </Button>
    </form>
  );
}

