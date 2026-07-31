import { ShieldCheck, Lock, Sparkles } from "lucide-react";
import { RazorpayStandardCheckout } from "@/components/checkout/razorpay-standard-checkout";

export const metadata = {
  title: "Razorpay Standard Checkout Integration | KanchKart",
  description: "Test Razorpay Standard Web Checkout payment integration"
};

export default function RazorpayDemoPage() {
  return (
    <div className="container max-w-xl py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 border border-gold/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
          <Sparkles className="h-3.5 w-3.5" />
          Razorpay Standard Web Checkout Integration
        </span>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Test Payment Gateway</h1>
        <p className="text-xs text-muted-foreground">
          Complete end-to-end integration: Order Creation (Backend) → Checkout Modal (Frontend) → Signature Verification (Backend HMAC-SHA256).
        </p>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gold/15">
          <div>
            <h2 className="font-serif font-bold text-lg text-charcoal">Pure Glass Water Bottle</h2>
            <p className="text-xs text-muted-foreground">Textured Grip • 1000ml Borosilicate</p>
          </div>
          <p className="font-serif font-bold text-xl text-charcoal">₹199.00</p>
        </div>

        <div className="space-y-3 text-xs text-slate-700 bg-ivory/60 p-4 rounded-xl border border-gold/10">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Item Price</span>
            <span className="font-semibold text-charcoal">₹199.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Charge</span>
            <span className="font-semibold text-emerald-700">FREE</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gold/15 font-bold text-sm text-charcoal">
            <span>Total Payable Amount</span>
            <span className="text-amber-800">₹199.00 (19900 Paise)</span>
          </div>
        </div>

        {/* Razorpay Standard Web Checkout Component */}
        <RazorpayStandardCheckout
          amountInRupees={199}
          buttonText="Pay ₹199 Now with Razorpay"
          customerName="Test Customer"
          customerEmail="test@kanchkart.com"
          customerPhone="+919876543210"
        />

        <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>256-bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-4 w-4 text-amber-600" />
            <span>100% Verified Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
}
