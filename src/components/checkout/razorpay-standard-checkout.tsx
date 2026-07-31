"use client";

import { useState } from "react";
import Script from "next/script";
import { CreditCard, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";



type Props = {
  amountInRupees?: number; // e.g. 199 for ₹199
  amountInPaise?: number; // e.g. 19900 for ₹199
  buttonText?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess?: (details: { paymentId: string; orderId: string }) => void;
};

export function RazorpayStandardCheckout({
  amountInRupees = 199,
  amountInPaise,
  buttonText = "Pay Securely with Razorpay",
  customerName = "Guest Customer",
  customerEmail = "customer@example.com",
  customerPhone = "+91 98765 43210",
  onSuccess
}: Props) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Compute final amount in paise (minimum 100 paise)
  const finalAmountPaise = amountInPaise || Math.max(100, Math.round(amountInRupees * 100));

  async function handleCheckout() {
    setLoading(true);
    setStatusMsg(null);

    try {
      // 1. BACKEND - Call /api/create-order
      const createRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmountPaise,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`
        })
      });

      const orderData = await createRes.json();

      if (!createRes.ok) {
        setLoading(false);
        setStatusMsg({
          type: "error",
          text: orderData.error || "Failed to create Razorpay payment order."
        });
        return;
      }

      const orderId = orderData.order_id || orderData.id;
      const razorpayKey = env.publicRazorpayKeyId || env.razorpayKeyId || "rzp_test_TK0IpLD5Hf9FBM";

      if (!window.Razorpay) {
        setLoading(false);
        setStatusMsg({
          type: "error",
          text: "Razorpay SDK failed to load. Please check your internet connection and refresh."
        });
        return;
      }

      // 2. FRONTEND - Configure and open Razorpay Standard Modal
      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: env.brandName || "KanchKart",
        description: "Pure Glassware Order Payment",
        order_id: orderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        theme: {
          color: "#D4AF37" // KanchKart Gold Accent
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setStatusMsg({
              type: "info",
              text: "Payment cancelled by user."
            });
          }
        },
        // 3. FRONTEND - Handle Payment Success & Call /api/verify-payment
        handler: async (response: RazorpaySuccessResponse) => {
          setStatusMsg({
            type: "info",
            text: "Verifying payment signature with server..."
          });

          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.status === "success") {
              setLoading(false);
              setStatusMsg({
                type: "success",
                text: `Payment Successful! Payment ID: ${response.razorpay_payment_id}`
              });
              if (onSuccess) {
                onSuccess({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id
                });
              }
            } else {
              setLoading(false);
              setStatusMsg({
                type: "error",
                text: verifyData.error || "Payment verification failed. Signature mismatch."
              });
            }
          } catch (err: unknown) {
            setLoading(false);
            setStatusMsg({
              type: "error",
              text: err instanceof Error ? err.message : "Error verifying payment with server."
            });
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      // Handle payment failure event
      razorpayInstance.on("payment.failed", (failedResponse: unknown) => {
        setLoading(false);
        const failureDetails = (failedResponse as { error?: { description?: string } })?.error?.description;
        setStatusMsg({
          type: "error",
          text: `Payment Failed: ${failureDetails || "Transaction declined by bank or card issuer."}`
        });
      });

      razorpayInstance.open();
    } catch (err: unknown) {
      setLoading(false);
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "An error occurred during checkout."
      });
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Load Razorpay Standard Checkout SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <Button
        type="button"
        variant="gold"
        disabled={loading}
        onClick={handleCheckout}
        className="w-full gap-2 py-6 text-base font-bold shadow-gold-glow"
      >
        <CreditCard className="h-5 w-5" />
        <span>{loading ? "Initializing Razorpay..." : `${buttonText} (₹${(finalAmountPaise / 100).toFixed(2)})`}</span>
      </Button>

      {/* Status Messages */}
      {statusMsg ? (
        <div
          className={`flex items-start gap-3 rounded-xl p-4 text-xs font-semibold border ${
            statusMsg.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
              : statusMsg.type === "error"
              ? "bg-rose-950/80 border-rose-500/50 text-rose-300"
              : "bg-amber-950/80 border-amber-500/50 text-amber-300"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : statusMsg.type === "error" ? (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          ) : (
            <ShieldCheck className="h-5 w-5 shrink-0 text-amber-400" />
          )}
          <div className="space-y-0.5">
            <p className="font-bold uppercase tracking-wider">{statusMsg.type}</p>
            <p className="leading-relaxed">{statusMsg.text}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
