"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, UserPlus, KeyRound, ArrowRight, Loader2, CheckCircle2, AlertCircle, RefreshCw, Mail, UserCheck, Sparkles } from "lucide-react";

export function AuthOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  // Step 1: Input details (Name, Email, Password)
  // Step 2: Input 6-digit OTP received in email
  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [canDirectRegister, setCanDirectRegister] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle Step 1: Send OTP to Email
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setCanDirectRegister(false);

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError("Please enter a valid full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name
        })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setStep(2);
        setInfoMessage(data.message || `Verification OTP sent to ${formData.email}. Please check your email inbox.`);
        if (data.canBypass) {
          setCanDirectRegister(true);
        }
        setResendTimer(60);
      } else {
        setError(data.error || "Failed to send verification OTP.");
        if (data.canBypass) {
          setCanDirectRegister(true);
        }
      }
    } catch {
      setLoading(false);
      setError("Network error while sending OTP.");
    }
  }

  // Handle Direct Signup Fallback if Resend API Key is restricted
  async function handleDirectRegister() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          otp: "BYPASS"
        })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setInfoMessage("🎉 Account created successfully! Redirecting to login...");
        setTimeout(() => {
          const successMsg = encodeURIComponent("Account created successfully! Please log in to continue.");
          const target = `/login?message=${successMsg}${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`;
          router.push(target);
        }, 1200);
      } else {
        setError(data.error || "Direct registration failed.");
      }
    } catch {
      setLoading(false);
      setError("Failed to complete direct registration.");
    }
  }

  // Handle OTP Input boxes
  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      if (digits.length > 0) {
        const newOtp = [...otpCode];
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtpCode(newOtp);
        const lastInput = document.getElementById(`otp-input-${Math.min(digits.length - 1, 5)}`);
        lastInput?.focus();
        return;
      }
    }

    const digit = value.replace(/\D/g, "");
    const newOtp = [...otpCode];
    newOtp[index] = digit;
    setOtpCode(newOtp);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  }

  // Handle Step 2: Verify OTP and Register Account
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fullOtp = otpCode.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP code sent to your email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          otp: fullOtp
        })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setInfoMessage("🎉 Email Verified! Account created successfully. Redirecting to login...");
        setTimeout(() => {
          const successMsg = encodeURIComponent("Account verified & created successfully! Please log in to continue.");
          const target = `/login?message=${successMsg}${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`;
          router.push(target);
        }, 1200);
      } else {
        setError(data.error || "OTP verification failed.");
      }
    } catch {
      setLoading(false);
      setError("Network error during OTP verification.");
    }
  }

  return (
    <div className="rounded-3xl border border-amber-200/60 bg-white/95 p-6 sm:p-8 shadow-xl max-w-md mx-auto space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
          {step === 1 ? <UserPlus className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
        </div>
        <h1 className="font-serif text-3xl font-bold text-slate-900">
          {step === 1 ? "Create KanchKart Account" : "Enter Verification OTP"}
        </h1>
        <p className="text-xs text-slate-500">
          {step === 1
            ? "Sign up with email OTP verification to start shopping & tracking orders"
            : `Verification code sent to ${formData.email}`}
        </p>
      </div>

      {/* Info / Success Banners */}
      {infoMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-start gap-2.5">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>

          {canDirectRegister && (
            <Button
              type="button"
              onClick={handleDirectRegister}
              variant="gold"
              className="w-full font-bold py-2 text-slate-950 text-xs rounded-lg gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Complete Account Signup Now</span>
            </Button>
          )}
        </div>
      )}

      {step === 1 ? (
        /* ── STEP 1: Account Information Form ── */
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-xs font-bold text-slate-700">Full Name *</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rishabh Sharma"
              className="mt-1 font-medium"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address (for OTP) *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              className="mt-1 font-medium"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-xs font-bold text-slate-700">Password *</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 8 characters"
              className="mt-1 font-medium"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full font-bold py-6 text-slate-950 rounded-xl gap-2" variant="gold">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending OTP to Email...
              </>
            ) : (
              <>
                <span>Send OTP to Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      ) : (
        /* ── STEP 2: 6-Digit OTP Verification Form ── */
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 text-center block">
              Enter 6-Digit Email OTP Code *
            </Label>
            
            {/* 6 Digit Input Boxes */}
            <div className="flex justify-center items-center gap-2">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 text-center text-xl font-bold font-mono border-2 border-amber-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-400 bg-white text-slate-900 shadow-sm"
                  required
                />
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full font-bold py-6 text-slate-950 rounded-xl gap-2" variant="gold">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying OTP...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Verify OTP & Create Account</span>
              </>
            )}
          </Button>

          {canDirectRegister && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2">
              <p className="text-[11px] text-amber-900 font-medium">Resend Testing Mode Active: You can complete registration directly below.</p>
              <Button
                type="button"
                onClick={handleDirectRegister}
                variant="gold"
                size="sm"
                className="w-full font-bold text-slate-950 text-xs rounded-lg"
              >
                Complete Account Signup Now
              </Button>
            </div>
          )}

          {/* Resend OTP & Back options */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-slate-500 hover:text-slate-800 underline"
            >
              ← Edit Email
            </button>

            <button
              type="button"
              disabled={resendTimer > 0 || loading}
              onClick={handleSendOtp}
              className="font-bold text-amber-700 hover:text-amber-800 disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend Email OTP"}
            </button>
          </div>
        </form>
      )}

      {/* Footer Link to Login */}
      <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
        Already have an account?{" "}
        <Link className="font-bold text-amber-700 hover:text-amber-800 underline underline-offset-4" href="/login">
          Log In
        </Link>
      </div>
    </div>
  );
}
