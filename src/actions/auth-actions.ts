"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8)
});

export async function loginAction(_: unknown, formData: FormData) {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      redirectTo: "/account"
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Invalid email or password." };
    throw error;
  }
}

export async function registerAction(_: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) return { error: "Enter a valid name, email, and password." };

  const existing = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) return { error: "An account already exists for this email." };

  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await bcrypt.hash(parsed.data.password, 12)
    }
  });

  await signIn("credentials", {
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    redirectTo: "/admin"
  });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
