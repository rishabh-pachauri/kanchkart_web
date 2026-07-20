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
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    // First, check the user's role to determine redirect
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { role: true }
    });

    const redirectUrl = user?.role === "ADMIN" ? "/admin" : "/account";

    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectUrl
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

  // New registrations default to CUSTOMER, so redirect to /account
  await signIn("credentials", {
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    redirectTo: "/account"
  });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
