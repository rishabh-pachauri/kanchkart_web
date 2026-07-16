import type { Metadata } from "next";
import { env } from "@/lib/env";
import { absoluteUrl } from "@/lib/utils";

export function siteMetadata(input: {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
}): Metadata {
  const title = input.title ? `${input.title} | ${env.brandName}` : `${env.brandName} | Premium Glassware`;
  const description =
    input.description ||
    "Shop premium glass bottles, jars, cups, containers, and luxury kitchen glassware from KanchKart.";
  const url = absoluteUrl(input.path || "/");
  const image = input.image ? absoluteUrl(input.image) : absoluteUrl("/brand/hero-glassware.svg");

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: env.brandName,
      images: [{ url: image }],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export function productJsonLd(product: {
  name: string;
  description: string;
  slug: string;
  sku: string;
  image?: string | null;
  price: string | number;
  stock: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.image ? [absoluteUrl(product.image)] : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "INR",
      price: String(product.price),
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };
}

