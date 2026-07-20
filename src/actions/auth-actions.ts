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

    // Validate inputs
    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    // Check if user exists and get their role
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, role: true }
    });

    if (!user) {
      return { error: "Invalid email or password." };
    }

    // Determine redirect URL based on role
    const redirectUrl = user.role === "ADMIN" ? "/admin" : "/account";

    // Sign in user
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectUrl
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // Re-throw other errors
    throw error;
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

  // Check if user already exists
  const existing = await db.user.findUnique({ 
    where: { email } 
  });

  if (existing) {
    return { error: "An account already exists for this email." };
  }

  // Create new user (defaults to CUSTOMER role)
  try {
    await db.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash: await bcrypt.hash(parsed.data.password, 12)
      }
    });

    // Sign in after registration
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/account"
    });
  } catch (error) {
    return { error: "Failed to create account. Please try again." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
