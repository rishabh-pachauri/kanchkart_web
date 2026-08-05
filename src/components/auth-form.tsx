"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, registerAction } from "@/actions/auth-actions";
import { UserPlus, LogIn, AlertCircle, Info, CheckCircle2 } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [state, action, pending] = useActionState(mode === "login" ? loginAction : registerAction, null);
  const searchParams = useSearchParams();
  
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const messageParam = searchParams.get("message") || searchParams.get("error") || "";
  const isSuccessMessage = messageParam.toLowerCase().includes("success") || messageParam.toLowerCase().includes("created");

  const loginLink = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login";
  const registerLink = callbackUrl ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/register";

  return (
    <form action={action} className="rounded-3xl border border-amber-200/60 bg-white/90 p-6 sm:p-8 shadow-xl max-w-md mx-auto space-y-6">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
          {mode === "login" ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
        </div>
        <h1 className="font-serif text-3xl font-bold text-slate-900">
          {mode === "login" ? "Welcome Back to KanchKart" : "Create Your KanchKart Account"}
        </h1>
        <p className="text-xs text-slate-500">
          {mode === "login"
            ? "Log in to manage orders, saved addresses, and express checkout"
            : "Sign up first to add items to your cart, save addresses, and place orders"}
        </p>
      </div>

      {/* Alert / Success Banners */}
      {messageParam && !state?.error ? (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 border ${
            isSuccessMessage
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          {isSuccessMessage ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <span>{messageParam}</span>
        </div>
      ) : null}

      <div className="space-y-4">
        {mode === "register" ? (
          <div>
            <Label htmlFor="name" className="text-xs font-bold text-slate-700">Full Name *</Label>
            <Input id="name" name="name" required placeholder="e.g. Rishabh Sharma" className="mt-1 font-medium" />
          </div>
        ) : null}

        <div>
          <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address *</Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" className="mt-1 font-medium" />
        </div>

        <div>
          <Label htmlFor="password" className="text-xs font-bold text-slate-700">Password *</Label>
          <Input id="password" name="password" type="password" required minLength={8} placeholder="At least 8 characters" className="mt-1 font-medium" />
        </div>
      </div>

      {state?.error ? (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <Button className="w-full font-bold py-6 text-slate-950 rounded-xl" variant="gold" disabled={pending}>
        {pending ? "Please wait..." : mode === "login" ? "Log In & Continue" : "Sign Up & Continue"}
      </Button>

      <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
        {mode === "login" ? "New to KanchKart?" : "Already have an account?"}{" "}
        <Link className="font-bold text-amber-700 hover:text-amber-800 underline underline-offset-4" href={mode === "login" ? registerLink : loginLink}>
          {mode === "login" ? "Create Account (Sign Up)" : "Log In"}
        </Link>
      </div>
    </form>
  );
}
