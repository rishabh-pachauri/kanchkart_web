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
  name: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(200),
  sku: z.string().trim().min(3).max(80),
  description: z.string().trim().min(20),
  shortDescription: z.string().trim().max(220).optional(),
  categoryId: z.string().min(1),
  collectionId: z.string().optional(),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0),
  lowStockAt: z.coerce.number().int().min(0),
  gstPercent: z.coerce.number().min(0).max(28),
  imageUrl: z.string().trim().url().or(z.string().startsWith("/")).optional(),
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

