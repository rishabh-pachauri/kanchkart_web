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
    const email = String(formData.get("email") || "").toLowerCase();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, role: true }
    });

    if (!user) {
      return { error: "Invalid email or password." };
    }

    const redirectUrl = user.role === "ADMIN" ? "/admin" : "/account";

    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectUrl
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }
}

export async function registerAction(_: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { error: "Enter a valid name, email, and password." };
  }

  const email = parsed.data.email.toLowerCase();

  const existing = await db.user.findUnique({ 
    where: { email } 
  });

  if (existing) {
    return { error: "An account already exists for this email." };
  }

  try {
    await db.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash: await bcrypt.hash(parsed.data.password, 12)
      }
    });

    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/account"
    });
  } catch {
    return { error: "Failed to create account. Please try again." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
