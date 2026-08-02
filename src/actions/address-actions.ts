"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/security";
import { z } from "zod";

const addressSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().min(10, "Valid phone number is required"),
  line1: z.string().trim().min(3, "Address line 1 is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  postalCode: z.string().trim().min(6, "Valid PIN Code is required"),
  country: z.string().trim().default("India"),
  landmark: z.string().trim().optional()
});

export async function addAddressAction(formData: FormData) {
  const user = await requireUser();

  const parsed = addressSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: "India",
    landmark: formData.get("landmark") || undefined
  });

  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Invalid address data";
    return { error: errorMsg };
  }

  await db.address.create({
    data: {
      userId: user.id,
      ...parsed.data
    }
  });

  revalidatePath("/account");
  return { success: true };
}

export async function deleteAddressAction(addressId: string) {
  const user = await requireUser();

  await db.address.deleteMany({
    where: {
      id: addressId,
      userId: user.id
    }
  });

  revalidatePath("/account");
  return { success: true };
}
