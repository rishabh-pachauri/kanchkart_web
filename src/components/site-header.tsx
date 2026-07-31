import Image from "next/image";
import Link from "next/link";
import { Menu, Search, UserRound, Sparkles } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { CartLink } from "@/components/cart/cart-link";
import { Button } from "@/components/ui/button";
import { getNavigationData } from "@/lib/commerce";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const primaryLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/best-sellers", label: "Best Sellers" },
  { href: "/offers", label: "Offers" }
];

export async function SiteHeader() {
  const [{ categories }, session, activeCoupon] = await Promise.all([
    getNavigationData(),
    auth(),
    db.coupon.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const promoCodeText = activeCoupon
    ? `Use Code: ${activeCoupon.code} (${activeCoupon.description || `${activeCoupon.type === "PERCENTAGE" ? activeCoupon.value + "%" : "₹" + activeCoupon.value} OFF`})`
    : "Use Code: KANCH10";

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-charcoal text-ivory text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2 border-b border-gold/20">
        <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse shrink-0" />
        <span>Free Express Shipping Across India</span>
        <span className="hidden md:inline text-gold font-bold">| {promoCodeText}</span>
      </div>

      <header className="sticky top-0 z-40 border-b border-gold/15 bg-ivory/85 backdrop-blur-xl transition-all">
        <div className="container flex h-16 items-center justify-between gap-3">
          <Link href="/" className="focus-ring flex items-center gap-3 rounded-md group">
            <div className="relative w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center transition-transform group-hover:scale-105">
              <Image src="/brand/logo-mark.svg" alt="KanchKart Logo" width={32} height={32} priority />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold leading-none text-charcoal tracking-wide">
                Kanch<span className="text-gold">Kart</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                Pure Glassware
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="focus-ring rounded-full px-4 py-1.5 text-sm font-medium text-charcoal/80 transition-all hover:bg-gold/10 hover:text-charcoal"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/shop"
              aria-label="Search products"
              className="focus-ring hidden h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-white/80 text-charcoal/80 transition hover:border-gold hover:text-charcoal md:inline-flex"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href={session?.user ? "/account" : "/login"}
              aria-label="My account"
              className="focus-ring hidden h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-white/80 text-charcoal/80 transition hover:border-gold hover:text-charcoal md:inline-flex"
            >
              <UserRound className="h-4 w-4" />
            </Link>
            <CartLink />
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden rounded-full border-gold/20" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm" />
                <Dialog.Content className="fixed right-0 top-0 z-50 h-dvh w-[86vw] max-w-sm border-l bg-ivory p-6 shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-gold/20">
                    <Dialog.Title className="font-serif text-2xl font-bold text-charcoal">KanchKart</Dialog.Title>
                  </div>
                  <div className="mt-6 grid gap-2">
                    {[...primaryLinks, { href: "/track-order", label: "Track Order" }, { href: "/contact", label: "Contact" }].map(
                      (link) => (
                        <Dialog.Close asChild key={link.href}>
                          <Link href={link.href} className="rounded-lg border border-gold/15 bg-white/80 px-4 py-3 font-medium text-charcoal transition hover:border-gold">
                            {link.label}
                          </Link>
                        </Dialog.Close>
                      )
                    )}
                  </div>
                  <div className="mt-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
                    <div className="mt-3 grid gap-2">
                      {categories.map((category) => (
                        <Dialog.Close asChild key={category.id}>
                          <Link
                            href={`/shop?category=${category.slug}`}
                            className="rounded-md px-3 py-2 text-sm text-charcoal/80 hover:bg-gold/10"
                          >
                            {category.name}
                          </Link>
                        </Dialog.Close>
                      ))}
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </header>
    </>
  );
}
