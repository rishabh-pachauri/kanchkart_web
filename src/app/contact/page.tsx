import Link from "next/link";
import { Phone, Mail, Globe, Instagram, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { getBrandSetting } from "@/lib/commerce";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Contact",
  description:
    "Contact KanchKart for product, order, wholesale, or support questions."
});

export default async function ContactPage() {
  const brand = await getBrandSetting();

  return (
    <section className="container py-12">

      {/* Hero */}
      <div className="mx-auto max-w-4xl text-center mb-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold">
          KANCHKART
        </p>

        <h1 className="mt-4 font-serif text-5xl font-bold">
          Let&apos;s Connect
        </h1>

        <p className="mt-4 text-muted-foreground text-lg">
          Premium Glassware For Modern Living.
          <br />
          <span className="font-medium text-gold">
            Glass Over Plastic.
          </span>
        </p>
      </div>

      {/* Quick Connect */}
      <div className="mb-16 rounded-3xl border bg-card p-8 shadow-xl">

        <h2 className="text-3xl font-semibold mb-2">
          Quick Connect
        </h2>

        <p className="text-muted-foreground mb-8">
          Reach us instantly using your preferred method.
        </p>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          <Link
            href="tel:+918218441794"
            className="rounded-2xl border p-6 transition hover:border-gold hover:shadow-lg"
          >
            <Phone className="mb-3 h-7 w-7 text-gold" />
            <h3 className="font-semibold">Call Us</h3>
            <p className="text-sm text-muted-foreground">
              +91 82184 41794
            </p>
          </Link>

          <Link
            href="https://wa.me/918218441794?text=Hi%20KanchKart,%20I%20have%20a%20query."
            target="_blank"
            className="rounded-2xl border p-6 transition hover:border-green-500 hover:shadow-lg"
          >
            <MessageCircle className="mb-3 h-7 w-7 text-green-500" />
            <h3 className="font-semibold">WhatsApp</h3>
            <p className="text-sm text-muted-foreground">
              Chat instantly
            </p>
          </Link>

          <Link
            href="mailto:kanchkart@gmail.com"
            className="rounded-2xl border p-6 transition hover:border-gold hover:shadow-lg"
          >
            <Mail className="mb-3 h-7 w-7 text-gold" />
            <h3 className="font-semibold">Email</h3>
            <p className="text-sm text-muted-foreground">
              kanchkart@gmail.com
            </p>
          </Link>

          <Link
            href="https://www.kanchkart.com"
            target="_blank"
            className="rounded-2xl border p-6 transition hover:border-gold hover:shadow-lg"
          >
            <Globe className="mb-3 h-7 w-7 text-gold" />
            <h3 className="font-semibold">Website</h3>
            <p className="text-sm text-muted-foreground">
              Visit KanchKart
            </p>
          </Link>

          <Link
            href="https://instagram.com/kanchkart"
            target="_blank"
            className="rounded-2xl border p-6 transition hover:border-pink-500 hover:shadow-lg"
          >
            <Instagram className="mb-3 h-7 w-7 text-pink-500" />
            <h3 className="font-semibold">Instagram</h3>
            <p className="text-sm text-muted-foreground">
              @kanchkart
            </p>
          </Link>

          <Link
            href="/products"
            className="rounded-2xl border bg-gold p-6 text-center text-black transition hover:scale-[1.02]"
          >
            <h3 className="font-semibold text-lg">
              Browse Collection →
            </h3>
            <p className="mt-2 text-sm">
              Explore premium glassware
            </p>
          </Link>

        </div>
      </div>

      {/* Existing Contact Info + Form */}
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

        <div>

          <p className="text-sm font-semibold uppercase text-gold">
            Contact Information
          </p>

          <h2 className="mt-2 font-serif text-4xl font-semibold">
            We are here to help.
          </h2>

          <div className="mt-6 space-y-4 text-muted-foreground">

            {brand?.email && (
              <p>
                <strong>Email:</strong> {brand.email}
              </p>
            )}

            {brand?.phone && (
              <p>
                <strong>Phone:</strong> {brand.phone}
              </p>
            )}

            {brand?.address && (
              <p>
                <strong>Address:</strong> {brand.address}
              </p>
            )}

            <div className="rounded-2xl bg-muted p-5 mt-6">
              <h3 className="font-semibold mb-2">
                Need Assistance?
              </h3>

              <p className="text-sm">
                We&apos;re happy to help with:
              </p>

              <ul className="mt-3 space-y-2 text-sm list-disc pl-5">
                <li>Product Information</li>
                <li>Bulk Orders</li>
                <li>Wholesale Enquiries</li>
                <li>Customer Support</li>
              </ul>
            </div>

          </div>

        </div>

        <ContactForm />

      </div>

    </section>
  );
}
