import { z } from "zod";

export const emailSchema = z.string().trim().email().max(160);
export const phoneSchema = z.string().trim().min(8).max(18);

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1).max(50)
});

export const addressSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  phone: phoneSchema,
  line1: z.string().trim().min(4).max(180),
  line2: z.string().trim().max(180).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(4).max(12),
  country: z.string().trim().min(2).max(80).default("India"),
  landmark: z.string().trim().max(120).optional()
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  address: addressSchema,
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  couponCode: z.string().trim().max(40).optional()
});

export const productSchema = z.object({
  name: z.string().trim().min(3, "Product name must be at least 3 characters long").max(180),
  slug: z.string().trim().min(3, "Slug must be at least 3 characters long").max(200),
  sku: z.string().trim().min(3, "SKU must be at least 3 characters long").max(80),
  description: z.string().trim().min(20, "Description must be at least 20 characters long"),
  shortDescription: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().trim().max(220, "Short description cannot exceed 220 characters").optional()
  ),
  categoryId: z.string().min(1, "Please select a category"),
  collectionId: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
  price: z.coerce.number({ invalid_type_error: "Price must be a valid number" }).positive("Price must be greater than 0"),
  compareAtPrice: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().positive("Compare at price must be greater than 0").optional()
  ),
  stock: z.coerce.number({ invalid_type_error: "Stock must be a number" }).int("Stock must be an integer").min(0, "Stock cannot be negative"),
  lowStockAt: z.coerce.number({ invalid_type_error: "Low stock threshold must be a number" }).int("Low stock threshold must be an integer").min(0, "Low stock threshold cannot be negative"),
  gstPercent: z.coerce.number({ invalid_type_error: "GST % must be a number" }).min(0, "GST % cannot be negative").max(28, "GST % cannot exceed 28%"),
  imageUrl: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().trim().url("Primary image URL must be a valid URL or starting with /").or(z.string().startsWith("/")).optional()
  ),
  additionalImages: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().trim().optional()
  ),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  isBestSeller: z.coerce.boolean().default(false),
  isNewArrival: z.coerce.boolean().default(false)
});

export const cmsSectionSchema = z.object({
  key: z.string().trim().min(2).max(80),
  placement: z.enum([
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
  ]),
  title: z.string().trim().min(2).max(180),
  eyebrow: z.string().trim().max(120).optional(),
  body: z.string().trim().max(2000).optional(),
  imageUrl: z.string().trim().optional(),
  videoUrl: z.string().trim().optional(),
  ctaLabel: z.string().trim().max(80).optional(),
  ctaHref: z.string().trim().max(180).optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true)
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().trim().min(4).max(80),
  email: emailSchema
});

