import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const providers: NextAuthConfig["providers"] = [
  ...(env.googleClientId && env.googleClientSecret
    ? [
        Google({
          clientId: env.googleClientId,
          clientSecret: env.googleClientSecret
        })
      ]
    : []),
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const user = await db.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() }
      });

      if (!user?.passwordHash) return null;
      const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!isValid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role
      };
    }
  })
];

export const authConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt"
  },
  secret: env.authSecret,
  pages: {
    signIn: "/login"
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = "role" in user ? user.role : "CUSTOMER";
      }

      if (token.email && !token.role) {
        const saved = await db.user.findUnique({
          where: { email: token.email },
          select: { role: true }
        });
        token.role = saved?.role ?? "CUSTOMER";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "CUSTOMER" | "ADMIN" | "STAFF") ?? "CUSTOMER";
      }
      return session;
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

