import Image from "next/image";
import Link from "next/link";
import { Menu, Search, UserRound, Sparkles, UserCheck, LogIn, LogOut, MapPin, Package, ShieldCheck } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { CartLink } from "@/components/cart/cart-link";
import { Button } from "@/components/ui/button";
import { getNavigationData } from "@/lib/commerce";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logoutAction } from "@/actions/auth-actions";

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
      where: {
        isActive: true,
        OR: [
          { usageLimit: null },
          { usageLimit: { gt: 1 } }
        ]
      },
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

            {/* Profile Icon - Visible on Mobile & Desktop */}
            <Link
              href={session?.user ? "/account" : "/login"}
              aria-label="My Profile & Account"
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-white/80 text-charcoal/80 transition hover:border-gold hover:text-charcoal"
            >
              <UserRound className="h-4.5 w-4.5 text-slate-800" />
            </Link>

            <CartLink />

            {/* Mobile Navigation Drawer */}
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden rounded-full border-gold/20" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm" />
                <Dialog.Content className="fixed right-0 top-0 z-50 h-dvh w-[86vw] max-w-sm border-l bg-ivory p-6 shadow-2xl overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-gold/20">
                    <Dialog.Title className="font-serif text-2xl font-bold text-charcoal">KanchKart</Dialog.Title>
                  </div>

                  {/* Customer Account / Login Mobile Section */}
                  <div className="mt-4 mb-6">
                    {session?.user ? (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-amber-950 text-white shadow-md space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm shadow">
                            {(session.user.name || session.user.email || "U")[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm truncate">{session.user.name || "Customer"}</p>
                            <p className="text-[11px] text-amber-200 truncate">{session.user.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
                          <Dialog.Close asChild>
                            <Link href="/account" className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>My Profile</span>
                            </Link>
                          </Dialog.Close>

                          <Dialog.Close asChild>
                            <Link href="/account/orders" className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700">
                              <Package className="w-3.5 h-3.5" />
                              <span>My Orders</span>
                            </Link>
                          </Dialog.Close>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl border border-gold/25 bg-amber-50/70 text-slate-900 space-y-3 text-center">
                        <div>
                          <p className="font-bold text-sm text-amber-950">Welcome to KanchKart!</p>
                          <p className="text-xs text-slate-600 mt-0.5">Log in to view saved addresses & order history</p>
                        </div>
                        <Dialog.Close asChild>
                          <Link href="/login" className="block w-full py-2.5 px-4 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-sm hover:bg-amber-300 transition">
                            Login / Sign Up
                          </Link>
                        </Dialog.Close>
                      </div>
                    )}
                  </div>

                  {/* Primary Nav Links */}
                  <div className="grid gap-2">
                    {[...primaryLinks, { href: "/track-order", label: "Track Order" }, { href: "/contact", label: "Contact Us" }].map(
                      (link) => (
                        <Dialog.Close asChild key={link.href}>
                          <Link href={link.href} className="rounded-lg border border-gold/15 bg-white/80 px-4 py-3 font-medium text-charcoal transition hover:border-gold">
                            {link.label}
                          </Link>
                        </Dialog.Close>
                      )
                    )}
                  </div>

                  {/* Categories */}
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Glassware Categories</p>
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
