import { z } from "zod";

const cartSchema = z.array(
  z.object({
    productId: z.string().min(1),
    variantId: z.string().nullable().optional(),
    name: z.string(),
    slug: z.string(),
    price: z.number().finite().nonnegative(),
    image: z.string().nullable().optional(),
    quantity: z.number().int().min(1).max(50)
  })
);

export function parseSavedCart(value: string) {
  try {
    const parsed = cartSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}
