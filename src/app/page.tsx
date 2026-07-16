import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { getHomeContent } from "@/lib/commerce";

export default async function HomePage() {
  const { hero, promo, featuredProducts, categories, collections } = await getHomeContent();
  const heroImage = hero?.imageUrl || "/brand/hero-glassware.svg";
  const promoItems =
    (promo?.metadata as { items?: string[] } | null)?.items ?? [
      "Premium borosilicate and lead-free glass",
      "Secure protective shipping across India",
      "GST invoices and easy order tracking",
      "COD and Razorpay support"
    ];

  return (
    <>
      <section className="border-b">
        <div className="container grid min-h-[calc(100vh-4rem)] items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase text-gold">
              {hero?.eyebrow || "Premium glassware for modern homes"}
            </p>
            <h1 className="mt-4 font-serif text-5xl font-semibold leading-none md:text-7xl">
              {hero?.title || "Luxury glassware, made beautifully practical."}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {hero?.body ||
                "KanchKart curates durable bottles, jars, cups, and kitchen storage pieces with clean design and everyday utility."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold" size="lg">
                <Link href={hero?.ctaHref || "/shop"}>
                  {hero?.ctaLabel || "Shop glassware"} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/collections">Explore collections</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="glass-highlight relative aspect-[4/3] overflow-hidden rounded-md border bg-secondary shadow-soft">
              <Image
                src={heroImage}
                alt="Premium KanchKart glass bottles, jars, and cups"
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-14">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Premium Finish", Sparkles],
            ["Secure Packaging", ShieldCheck],
            ["Fast Dispatch", Truck],
            ["GST Invoice", Check]
          ].map(([label, Icon]) => (
            <div key={label as string} className="rounded-md border bg-white/70 p-5">
              <Icon className="h-6 w-6 text-gold" />
              <p className="mt-3 font-semibold">{label as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-secondary/55">
        <div className="container py-16">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Shop by need" title="Featured categories" />
            <Button asChild variant="outline">
              <Link href="/shop">View all</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group rounded-md border bg-ivory p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="relative aspect-[5/3] overflow-hidden rounded-md bg-white">
                  <Image
                    src={category.imageUrl || "/brand/pantry-jars.svg"}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-4 font-serif text-2xl font-semibold">{category.name}</h3>
                {category.description ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Customer favourites" title="Best sellers and new arrivals" />
          <Button asChild variant="outline">
            <Link href="/best-sellers">Best sellers</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="border-y bg-charcoal text-ivory">
        <div className="container grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="Why choose KanchKart"
            title={promo?.title || "Designed for clarity, packed for care."}
            body={promo?.body}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {promoItems.map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-white/6 p-5">
                <Check className="h-5 w-5 text-gold" />
                <p className="mt-3 text-sm leading-6 text-ivory/78">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Curated edits" title="Featured collections" />
          <Button asChild variant="outline">
            <Link href="/collections">All collections</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {collections.map((collection) => (
            <Link
              href={`/collections/${collection.slug}`}
              key={collection.id}
              className="rounded-md border bg-white/70 p-5 transition hover:shadow-soft"
            >
              <p className="font-serif text-3xl font-semibold">{collection.name}</p>
              {collection.description ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{collection.description}</p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

