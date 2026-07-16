import Image from "next/image";
import Link from "next/link";
import { Menu, Search, UserRound } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { CartLink } from "@/components/cart/cart-link";
import { Button } from "@/components/ui/button";
import { getNavigationData } from "@/lib/commerce";
import { auth } from "@/lib/auth";

const primaryLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/best-sellers", label: "Best Sellers" },
  { href: "/offers", label: "Offers" }
];

export async function SiteHeader() {
  const [{ categories }, session] = await Promise.all([getNavigationData(), auth()]);

  return (
    <header className="sticky top-0 z-40 border-b bg-ivory/90 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-md">
          <Image src="/brand/logo-mark.svg" alt="" width={38} height={38} priority />
          <span className="font-serif text-2xl font-semibold leading-none">KanchKart</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-charcoal/80 transition hover:text-charcoal"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/shop"
            aria-label="Search products"
            className="focus-ring hidden h-10 w-10 items-center justify-center rounded-md border bg-white/70 md:inline-flex"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href={session?.user ? "/account" : "/login"}
            aria-label="My account"
            className="focus-ring hidden h-10 w-10 items-center justify-center rounded-md border bg-white/70 md:inline-flex"
          >
            <UserRound className="h-5 w-5" />
          </Link>
          <CartLink />
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/35" />
              <Dialog.Content className="fixed right-0 top-0 z-50 h-dvh w-[86vw] max-w-sm border-l bg-ivory p-5 shadow-soft">
                <Dialog.Title className="font-serif text-2xl font-semibold">KanchKart</Dialog.Title>
                <div className="mt-8 grid gap-2">
                  {[...primaryLinks, { href: "/track-order", label: "Track Order" }, { href: "/contact", label: "Contact" }].map(
                    (link) => (
                      <Dialog.Close asChild key={link.href}>
                        <Link href={link.href} className="rounded-md border bg-white/70 px-4 py-3 font-medium">
                          {link.label}
                        </Link>
                      </Dialog.Close>
                    )
                  )}
                </div>
                <div className="mt-8">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Categories</p>
                  <div className="mt-3 grid gap-2">
                    {categories.map((category) => (
                      <Dialog.Close asChild key={category.id}>
                        <Link
                          href={`/shop?category=${category.slug}`}
                          className="rounded-md px-2 py-2 text-sm text-charcoal/80"
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
  );
}

