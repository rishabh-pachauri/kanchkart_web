import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck, Sparkles, Truck, Lock } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { getBrandSetting } from "@/lib/commerce";

export async function SiteFooter() {
  const brand = await getBrandSetting();

  return (
    <footer className="border-t border-gold/20 bg-charcoal text-ivory">
      {/* Top Trust Features Footer Bar */}
      <div className="border-b border-white/10 bg-white/5 py-8">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheck className="h-6 w-6 text-gold mb-2" />
            <p className="font-semibold text-xs text-ivory">100% Pure & Lead-Free</p>
            <p className="text-[11px] text-ivory/60">Non-toxic borosilicate glass</p>
          </div>
          <div className="flex flex-col items-center">
            <Truck className="h-6 w-6 text-gold mb-2" />
            <p className="font-semibold text-xs text-ivory">Break-Safe Shipping</p>
            <p className="text-[11px] text-ivory/60">Multi-layer protective transit</p>
          </div>
          <div className="flex flex-col items-center">
            <Lock className="h-6 w-6 text-gold mb-2" />
            <p className="font-semibold text-xs text-ivory">Secure Checkout</p>
            <p className="text-[11px] text-ivory/60">Razorpay & COD supported</p>
          </div>
          <div className="flex flex-col items-center">
            <Sparkles className="h-6 w-6 text-gold mb-2" />
            <p className="font-semibold text-xs text-ivory">Verified Quality</p>
            <p className="text-[11px] text-ivory/60">Crafted for everyday durability</p>
          </div>
        </div>
      </div>

      <div className="container grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-wide text-ivory">
            Kanch<span className="text-gold">Kart</span>
          </h2>
          <p className="mt-4 max-w-md text-xs leading-relaxed text-ivory/75">
            Premium borosilicate glass water bottles, airtight pantry jars, hand-blown cups, and modern kitchen storage designed for healthy, eco-friendly homes.
          </p>
          <div className="mt-6 grid gap-2.5 text-xs text-ivory/80">
            {brand?.email ? (
              <p className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-gold shrink-0" /> <span>{brand.email}</span>
              </p>
            ) : null}
            {brand?.phone ? (
              <p className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-gold shrink-0" /> <span>{brand.phone}</span>
              </p>
            ) : null}
            {brand?.address ? (
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 text-gold shrink-0" /> <span>{brand.address}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Quick Navigation</h3>
          <div className="mt-4 grid gap-2.5 text-xs text-ivory/80">
            <Link href="/shop" className="hover:text-gold transition">Shop Catalog</Link>
            <Link href="/collections" className="hover:text-gold transition">Curated Collections</Link>
            <Link href="/best-sellers" className="hover:text-gold transition">Best Sellers</Link>
            <Link href="/new-arrivals" className="hover:text-gold transition">New Arrivals</Link>
            <Link href="/track-order" className="hover:text-gold transition">Track Your Order</Link>
            <Link href="/contact" className="hover:text-gold transition">Contact Support</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Join KanchKart Insider</h3>
          <p className="mt-4 text-xs leading-relaxed text-ivory/75">
            Subscribe for exclusive launch offers, glass care tips, and secret sale access.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/30">
        <div className="container flex flex-col gap-3 py-6 text-xs text-ivory/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} KanchKart Commerce Inc. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <Link href="/privacy-policy" className="hover:text-gold transition">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:text-gold transition">Refund Policy</Link>
            <Link href="/shipping-policy" className="hover:text-gold transition">Shipping Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-gold transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
