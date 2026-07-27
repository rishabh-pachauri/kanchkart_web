"use client";

import { useActionState, useState } from "react";
import type { Category, Collection, Product, ProductMedia } from "@prisma/client";
import { createProductAction, updateProductAction } from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Sparkles, AlertCircle } from "lucide-react";
import Image from "next/image";

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

  const [imageUrl, setImageUrl] = useState(product?.media?.[0]?.url || "");

  return (
    <form action={action} className="space-y-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl text-slate-100">
      {isEditing ? <input type="hidden" name="id" value={product!.id} /> : null}

      {/* Form Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <span>{isEditing ? "Edit Product Details" : "Create New Product Listing"}</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Fill in the product specifications, pricing, inventory, and media below.
        </p>
      </div>

      {/* Section 1: Basic Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">1. Basic Information</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-slate-200 font-semibold">Product Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product?.name || ""}
              placeholder="e.g. Pure Glass Textured Water Bottle"
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-amber-400"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sku" className="text-slate-200 font-semibold">SKU (Stock Keeping Unit) *</Label>
            <Input
              id="sku"
              name="sku"
              defaultValue={product?.sku || ""}
              placeholder="e.g. KK-BTL-PG-199"
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-amber-400 font-mono"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug" className="text-slate-200 font-semibold">URL Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={product?.slug || ""}
              placeholder="Auto-generated from name if left blank"
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-amber-400 font-mono"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="categoryId" className="text-slate-200 font-semibold">Category *</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product?.categoryId || categories[0]?.id || ""}
              className="h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white focus:border-amber-400 focus:outline-none"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="collectionId" className="text-slate-200 font-semibold">Curated Collection</Label>
            <select
              id="collectionId"
              name="collectionId"
              defaultValue={product?.collectionId || ""}
              className="h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="">None (Standard Catalog Item)</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Pricing & Stock */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">2. Pricing & Inventory</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="price" className="text-slate-200 font-semibold">Selling Price (₹) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.price ? Number(product.price) : ""}
              placeholder="199"
              className="bg-slate-950 border-slate-800 text-amber-400 font-bold placeholder:text-slate-600 focus:border-amber-400"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="compareAtPrice" className="text-slate-200 font-semibold">Compare At Price (MRP ₹)</Label>
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.compareAtPrice ? Number(product.compareAtPrice) : ""}
              placeholder="299"
              className="bg-slate-950 border-slate-800 text-slate-400 placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stock" className="text-slate-200 font-semibold">Stock Quantity *</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              defaultValue={product?.stock ?? 500}
              placeholder="500"
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-amber-400"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lowStockAt" className="text-slate-200 font-semibold">Low Stock Threshold *</Label>
            <Input
              id="lowStockAt"
              name="lowStockAt"
              type="number"
              min="0"
              defaultValue={product?.lowStockAt ?? 5}
              className="bg-slate-950 border-slate-800 text-white focus:border-amber-400"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gstPercent" className="text-slate-200 font-semibold">GST % *</Label>
            <Input
              id="gstPercent"
              name="gstPercent"
              type="number"
              min="0"
              max="28"
              defaultValue={product?.gstPercent ? Number(product.gstPercent) : 18}
              className="bg-slate-950 border-slate-800 text-white focus:border-amber-400"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 3: Media & Image Preview */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">3. Primary Image Media</h3>
        <div className="grid gap-6 md:grid-cols-[1fr_140px]">
          <div className="grid gap-2">
            <Label htmlFor="imageUrl" className="text-slate-200 font-semibold">Primary Image URL or Asset Path</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="e.g. /products/pure-glass-water-bottle.jpg or Cloudinary URL"
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-amber-400"
            />
            <p className="text-xs text-slate-400">You can use local assets inside &quot;/public/products/&quot; or any external image URL.</p>
          </div>

          {/* Live Preview Box */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-[11px] font-semibold text-slate-400 mb-1">Live Preview</span>
            <div className="relative h-24 w-24 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <Image src={imageUrl} alt="Preview" fill className="object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6 text-slate-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Store Visibility Flags */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">4. Storefront Display Options</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950 text-sm">
          {[
            { key: "isActive", label: "Active (Visible)", defaultVal: product ? product.isActive : true },
            { key: "isFeatured", label: "Featured Item", defaultVal: product ? product.isFeatured : true },
            { key: "isBestSeller", label: "Best Seller", defaultVal: product ? product.isBestSeller : true },
            { key: "isNewArrival", label: "New Arrival", defaultVal: product ? product.isNewArrival : true }
          ].map(({ key, label, defaultVal }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer text-slate-200 hover:text-white transition">
              <input
                type="checkbox"
                name={key}
                defaultChecked={defaultVal}
                className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
              />
              <span className="font-medium">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Section 5: Descriptions */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">5. Product Description</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="shortDescription" className="text-slate-200 font-semibold">Short Summary</Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              defaultValue={product?.shortDescription || ""}
              placeholder="e.g. Pure, safe, and sustainable 750ml glass water bottle with stainless steel cap."
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-slate-200 font-semibold">Detailed Description (Min 20 Characters) *</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={
                product?.description ||
                "Switch from plastic to pure glass. Crafted from high-grade borosilicate glass, this eco-friendly 750ml water bottle features an elegant textured beaded grip and a leak-proof stainless steel cap. Pure, safe, and sustainable for everyday hydration."
              }
              rows={4}
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-amber-400 leading-relaxed"
              required
            />
          </div>
        </div>
      </div>

      {/* Error Alert Display */}
      {state?.error ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm font-medium text-red-300">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}

      {/* Actions */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-4">
        <Button
          type="submit"
          variant="gold"
          size="lg"
          disabled={pending}
          className="rounded-xl font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 px-8"
        >
          {pending ? "Saving Product..." : isEditing ? "Update Product Listing" : "Publish Product Listing"}
        </Button>
      </div>
    </form>
  );
}
