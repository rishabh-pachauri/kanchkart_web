"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, registerAction } from "@/actions/auth-actions";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [state, action, pending] = useActionState(mode === "login" ? loginAction : registerAction, null);

  return (
    <form action={action} className="rounded-md border bg-white/70 p-5 shadow-sm">
      <h1 className="font-serif text-4xl font-semibold">{mode === "login" ? "Welcome back" : "Create account"}</h1>
      <div className="mt-6 grid gap-4">
        {mode === "register" ? (
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
        ) : null}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>
      </div>
      {state?.error ? <p className="mt-4 text-sm text-destructive">{state.error}</p> : null}
      <Button className="mt-6 w-full" variant="gold" disabled={pending}>
        {pending ? "Please wait..." : mode === "login" ? "Login" : "Register"}
      </Button>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {mode === "login" ? "New to KanchKart?" : "Already have an account?"}{" "}
        <Link className="font-semibold text-charcoal" href={mode === "login" ? "/register" : "/login"}>
          {mode === "login" ? "Create account" : "Login"}
        </Link>
      </p>
    </form>
  );
}

