"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export async function loginAction(_: unknown, formData: FormData) {
  try {
    const email = String(formData.get("email") || "").toLowerCase().trim();
    const password = String(formData.get("password") || "");
    const callbackUrl = String(formData.get("callbackUrl") || "").trim();

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

    const defaultTarget = user.role === "ADMIN" ? "/admin" : "/account";
    const targetUrl = callbackUrl && !callbackUrl.startsWith("/admin") ? callbackUrl : defaultTarget;

    await signIn("credentials", {
      email,
      password,
      redirectTo: targetUrl
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // Re-throw Next.js redirect exceptions so navigation works
    throw err;
  }
}

export async function registerAction(_: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password")
  });
  const callbackUrl = String(formData.get("callbackUrl") || "").trim();

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Enter a valid name, email, and password (at least 8 characters)." };
  }

  const email = parsed.data.email.toLowerCase().trim();

  const existing = await db.user.findUnique({ 
    where: { email } 
  });

  if (existing) {
    return { error: "An account already exists for this email. Please log in below." };
  }

  try {
    await db.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash: await bcrypt.hash(parsed.data.password, 12)
      }
    });
  } catch {
    return { error: "Failed to create account. Please try again." };
  }

  // Redirect directly to the login page with success notification
  const successMessage = encodeURIComponent("Account created successfully! Please log in to continue.");
  const targetLogin = `/login?message=${successMessage}${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`;
  
  redirect(targetLogin);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
