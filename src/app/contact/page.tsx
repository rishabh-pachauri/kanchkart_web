import { ContactForm } from "@/components/contact-form";
import { getBrandSetting } from "@/lib/commerce";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Contact",
  description: "Contact KanchKart for product, order, wholesale, or support questions."
});

export default async function ContactPage() {
  const brand = await getBrandSetting();

  return (
    <section className="container grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="text-sm font-semibold uppercase text-gold">Contact</p>
        <h1 className="mt-2 font-serif text-5xl font-semibold">We are here to help.</h1>
        <div className="mt-6 grid gap-3 text-sm leading-6 text-muted-foreground">
          {brand?.email ? <p>Email: {brand.email}</p> : null}
          {brand?.phone ? <p>Phone: {brand.phone}</p> : null}
          {brand?.address ? <p>Address: {brand.address}</p> : null}
        </div>
      </div>
      <ContactForm />
    </section>
  );
}

