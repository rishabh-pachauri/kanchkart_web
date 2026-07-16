import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { getBrandSetting } from "@/lib/commerce";

export async function SiteFooter() {
  const brand = await getBrandSetting();

  return (
    <footer className="border-t bg-charcoal text-ivory">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <h2 className="font-serif text-3xl font-semibold">KanchKart</h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-ivory/72">
            Premium glass bottles, jars, cups, containers, and kitchen storage crafted for modern
            Indian homes.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-ivory/76">
            {brand?.email ? (
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" /> {brand.email}
              </p>
            ) : null}
            {brand?.phone ? (
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" /> {brand.phone}
              </p>
            ) : null}
            {brand?.address ? (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-gold" /> {brand.address}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase">Explore</h3>
          <div className="mt-4 grid gap-3 text-sm text-ivory/72">
            <Link href="/shop">Shop</Link>
            <Link href="/collections">Collections</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/track-order">Track Order</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase">Stay close</h3>
          <p className="mt-4 text-sm leading-6 text-ivory/72">
            Receive launch offers, care notes, and new collection drops.
          </p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-5 text-xs text-ivory/58 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} KanchKart. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/refund-policy">Refunds</Link>
            <Link href="/shipping-policy">Shipping</Link>
            <Link href="/terms-and-conditions">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

