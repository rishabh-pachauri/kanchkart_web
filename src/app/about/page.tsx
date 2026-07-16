import Image from "next/image";
import { db } from "@/lib/db";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "About Us",
  description: "Meet KanchKart, a premium glassware brand for modern Indian homes."
});

export default async function AboutPage() {
  const section = await db.cmsSection.findFirst({
    where: { placement: "ABOUT", isActive: true },
    orderBy: { sortOrder: "asc" }
  });

  return (
    <section className="container grid gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="text-sm font-semibold uppercase text-gold">{section?.eyebrow || "About KanchKart"}</p>
        <h1 className="mt-2 font-serif text-5xl font-semibold">
          {section?.title || "Premium glassware for homes that value clarity."}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {section?.body ||
            "KanchKart brings refined, durable, everyday glassware to Indian homes through thoughtful product selection, careful packaging, and reliable service."}
        </p>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-md border bg-secondary shadow-soft">
        <Image
          src={section?.imageUrl || "/brand/hero-glassware.svg"}
          alt="KanchKart premium glassware"
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}

