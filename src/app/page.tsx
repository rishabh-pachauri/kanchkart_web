import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Sparkles, Truck, Star, Award, HeartHandshake } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { getHomeContent } from "@/lib/commerce";

export default async function HomePage() {
  const { hero, promo, featuredProducts, categories, collections } = await getHomeContent();
  const heroImage = hero?.imageUrl || "/brand/hero-glassware.svg";
  const promoItems =
    (promo?.metadata as { items?: string[] } | null)?.items ?? [
      "100% Lead-Free & Non-Toxic Borosilicate Glass",
      "Reinforced Protective Eco-Friendly Shipping Across India",
      "GST Invoices & Instant Real-Time Tracking",
      "Flexible Payment: COD & Secure Razorpay Integration"
    ];

  return (
    <>
      {/* Luxury Hero Section */}
      <section className="relative overflow-hidden border-b border-gold/15 bg-gradient-to-b from-ivory via-ivory to-secondary/30">
        <div className="container grid min-h-[calc(100vh-6rem)] items-center gap-12 py-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-charcoal shadow-sm mb-6 animate-float">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>{hero?.eyebrow || "Pure Glassware For Modern Homes"}</span>
            </div>

            <h1 className="font-serif text-5xl font-bold leading-[1.08] text-charcoal md:text-7xl">
              {hero?.title || "Luxury glassware, crafted beautifully practical."}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {hero?.body ||
                "KanchKart curates durable borosilicate bottles, airtight jars, hand-blown cups, and kitchen storage pieces designed for healthy, eco-friendly living."}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild variant="gold" size="lg" className="rounded-full shadow-gold-glow">
                <Link href={hero?.ctaHref || "/shop"}>
                  {hero?.ctaLabel || "Shop Glassware Collection"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-gold/30 hover:border-gold">
                <Link href="/collections">Explore Collections</Link>
              </Button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-gold/15">
              <div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-lg">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span>4.9 / 5.0</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">5,000+ Verified Reviews</p>
              </div>
              <div>
                <p className="font-bold text-lg text-charcoal">50k+ Homes</p>
                <p className="text-xs text-muted-foreground mt-0.5">Delivered Across India</p>
              </div>
              <div>
                <p className="font-bold text-lg text-charcoal">100% Pure</p>
                <p className="text-xs text-muted-foreground mt-0.5">BPA & Lead Free</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="glass-highlight relative aspect-[4/3] overflow-hidden rounded-2xl border border-gold/20 bg-secondary shadow-soft">
              <Image
                src={heroImage}
                alt="Premium KanchKart glass bottles, jars, and cups"
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            {/* Floating accent badge */}
            <div className="absolute -bottom-5 -left-5 rounded-xl border border-gold/20 bg-white/90 backdrop-blur-md p-4 shadow-xl hidden sm:flex items-center gap-3">
              <Award className="h-8 w-8 text-gold" />
              <div>
                <p className="text-xs font-bold text-charcoal">Premium Borosilicate</p>
                <p className="text-[11px] text-muted-foreground">Thermal Shock Resistant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="container py-14">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            ["Premium Borosilicate", Sparkles, "High clarity & thermal resistance"],
            ["Break-Safe Packaging", ShieldCheck, "Multi-layered protective transit"],
            ["Express Pan-India", Truck, "Fast dispatch & real-time tracking"],
            ["GST Registered", Check, "Full tax invoice on all orders"]
          ].map(([title, Icon, desc]) => (
            <div
              key={title as string}
              className="group rounded-xl border border-gold/15 bg-white/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-soft"
            >
              <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold transition-colors group-hover:bg-gold group-hover:text-charcoal">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-charcoal text-base">{title as string}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{desc as string}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="border-y border-gold/15 bg-secondary/40 py-16">
        <div className="container">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Shop by need" title="Featured Categories" body="Explore our curated selection of functional, aesthetic glassware." />
            <Button asChild variant="outline" className="rounded-full border-gold/30">
              <Link href="/shop">View All Categories</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-gold/15 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-soft"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-ivory">
                  <Image
                    src={category.imageUrl || "/brand/pantry-jars.svg"}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-bold text-charcoal group-hover:text-gold transition-colors">
                    {category.name}
                  </h3>
                  <ArrowRight className="h-5 w-5 text-gold transition-transform group-hover:translate-x-1" />
                </div>
                {category.description ? (
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{category.description}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="container py-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Customer Favourites" title="Best Sellers & New Arrivals" body="Top rated hydration and kitchen glassware pieces." />
          <Button asChild variant="outline" className="rounded-full border-gold/30">
            <Link href="/best-sellers">Explore Best Sellers</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Why Choose KanchKart Dark Banner */}
      <section className="border-y border-gold/20 bg-charcoal text-ivory">
        <div className="container grid gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr] items-center">
          <div>
            <SectionHeading
              eyebrow="Why Choose KanchKart"
              title={promo?.title || "Designed for clarity, packed for care."}
              body={promo?.body || "Every piece is selected for premium finish, daily durability, secure packaging, and service that respects your home."}
            />
            <div className="mt-8 flex items-center gap-4">
              <Button asChild variant="gold" size="lg" className="rounded-full shadow-gold-glow">
                <Link href="/about">Learn Our Story</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {promoItems.map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-gold/30">
                <Check className="h-6 w-6 text-gold" />
                <p className="mt-3 text-sm leading-relaxed text-ivory/85 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Collections */}
      <section className="container py-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Curated Edits" title="Featured Collections" body="Handcrafted series tailored for modern entertaining and pantry storage." />
          <Button asChild variant="outline" className="rounded-full border-gold/30">
            <Link href="/collections">View All Collections</Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {collections.map((collection) => (
            <Link
              href={`/collections/${collection.slug}`}
              key={collection.id}
              className="group relative overflow-hidden rounded-2xl border border-gold/15 bg-white/80 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-soft"
            >
              <p className="font-serif text-3xl font-bold text-charcoal group-hover:text-gold transition-colors">{collection.name}</p>
              {collection.description ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{collection.description}</p>
              ) : null}
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-wider">
                <span>Discover Edit</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
