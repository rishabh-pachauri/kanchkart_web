import { Phone, Mail, Globe, Instagram, MessageCircle, MapPin, ExternalLink, ArrowRight } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Contact Us | KanchKart - Firozabad Glassware",
  description:
    "Get in touch with KanchKart. Located in Mahaveer Nagar, Firozabad (The Glass City of India). Call, email, or WhatsApp us directly."
});

export default function ContactPage() {
  const contactDetails = [
    {
      title: "Phone Support",
      value: "+91 82184 41794",
      subtext: "Mon - Sat (9:00 AM - 8:00 PM IST)",
      href: "tel:+918218441794",
      icon: Phone,
      color: "text-amber-500",
      borderColor: "hover:border-amber-500"
    },
    {
      title: "WhatsApp Chat",
      value: "Chat on WhatsApp",
      subtext: "+91 82184 41794 (Instant Response)",
      href: "https://wa.me/918218441794?text=Hi%20KanchKart%20Team,%20I%20have%20an%20inquiry.",
      target: "_blank",
      icon: MessageCircle,
      color: "text-emerald-500",
      borderColor: "hover:border-emerald-500"
    },
    {
      title: "Email Support",
      value: "kanchkart@gmail.com",
      subtext: "We respond within 24 business hours",
      href: "mailto:kanchkart@gmail.com",
      icon: Mail,
      color: "text-amber-500",
      borderColor: "hover:border-amber-500"
    },
    {
      title: "Store Location",
      value: "Mahaveer Nagar, Firozabad",
      subtext: "Uttar Pradesh 283203, India",
      href: "https://www.google.com/maps/search/?api=1&query=Mahaveer+Nagar+Firozabad+Uttar+Pradesh",
      target: "_blank",
      icon: MapPin,
      color: "text-rose-500",
      borderColor: "hover:border-rose-500"
    },
    {
      title: "Instagram",
      value: "@kanchkart",
      subtext: "Follow our latest glassware edits",
      href: "https://instagram.com/kanchkart",
      target: "_blank",
      icon: Instagram,
      color: "text-pink-500",
      borderColor: "hover:border-pink-500"
    },
    {
      title: "Official Website",
      value: "www.kanchkart.com",
      subtext: "Explore pure glass collection",
      href: "https://www.kanchkart.com",
      target: "_blank",
      icon: Globe,
      color: "text-amber-500",
      borderColor: "hover:border-amber-500"
    }
  ];

  return (
    <section className="container py-14">
      {/* Hero Banner */}
      <div className="mx-auto max-w-3xl text-center mb-14">
        <span className="inline-block rounded-full bg-gold/15 px-4 py-1 text-xs font-bold uppercase tracking-widest text-gold border border-gold/30">
          Glass Over Plastic
        </span>

        <h1 className="mt-4 font-serif text-5xl font-bold leading-tight text-charcoal">
          Get In Touch With Us
        </h1>

        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          Crafted & curated directly from <span className="font-semibold text-charcoal">Firozabad — The Glass City of India</span>. We are here to assist with retail orders, wholesale inquiries, and product support.
        </p>
      </div>

      {/* Clickable Quick Contact Grid */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-charcoal">Direct Contact Channels</h2>
            <p className="text-xs text-muted-foreground">Click any card below to connect directly</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {contactDetails.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.href}
                target={item.target || "_self"}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className={`group relative flex flex-col justify-between rounded-2xl border border-gold/20 bg-white/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 ${item.borderColor} hover:shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-xl bg-ivory border border-gold/20 flex items-center justify-center ${item.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 font-serif text-xl font-bold text-charcoal group-hover:text-gold transition-colors">
                    {item.value}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gold/10 flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span>{item.subtext}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-gold transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Main Section: Interactive Form + Store Address Info */}
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] items-start">
        {/* Detailed Address & Business Info */}
        <div className="rounded-2xl border border-gold/20 bg-white/90 p-8 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Firozabad HQ & Warehouse</span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-charcoal">
              Visit Our Firozabad Office
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              KanchKart operates directly out of Firozabad, India&apos;s renowned glassmaking hub, delivering authentic high-clarity borosilicate glassware across the nation.
            </p>
          </div>

          {/* Clickable Address Card */}
          <a
            href="https://www.google.com/maps/search/?api=1&query=Mahaveer+Nagar+Firozabad+Uttar+Pradesh"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-gold/30 bg-ivory/60 p-5 transition hover:border-gold hover:bg-ivory shadow-sm group"
          >
            <div className="flex items-start gap-3">
              <MapPin className="h-6 w-6 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-charcoal text-base group-hover:text-gold transition-colors flex items-center gap-1.5">
                  Mahaveer Nagar, Firozabad <ExternalLink className="h-3.5 w-3.5" />
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Uttar Pradesh - 283203, India
                </p>
                <p className="text-[11px] font-semibold text-gold mt-2">
                  📍 Click to Open in Google Maps →
                </p>
              </div>
            </div>
          </a>

          {/* Direct Phone & Email List */}
          <div className="space-y-3 pt-2">
            <a
              href="tel:+918218441794"
              className="flex items-center gap-3 text-sm text-charcoal font-semibold hover:text-gold transition-colors"
            >
              <Phone className="h-4 w-4 text-gold" />
              <span>Call: +91 82184 41794</span>
            </a>
            <a
              href="mailto:kanchkart@gmail.com"
              className="flex items-center gap-3 text-sm text-charcoal font-semibold hover:text-gold transition-colors"
            >
              <Mail className="h-4 w-4 text-gold" />
              <span>Email: kanchkart@gmail.com</span>
            </a>
          </div>

          <div className="rounded-xl border border-gold/15 bg-charcoal text-ivory p-6">
            <h3 className="font-serif text-lg font-bold text-gold">Bulk & Wholesale Orders</h3>
            <p className="mt-2 text-xs leading-relaxed text-ivory/80">
              Planning custom branding, corporate gifting, or wholesale glass procurement? Connect with our Firozabad team directly via WhatsApp or phone.
            </p>
            <a
              href="https://wa.me/918218441794?text=Hi%20KanchKart,%20I%20want%20to%20inquire%20about%20Wholesale%20Bulk%20Order."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-bold text-charcoal hover:bg-white transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-emerald-800 fill-emerald-800" />
              <span>Inquire for Wholesale →</span>
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-2xl border border-gold/20 bg-white/90 p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-2">Send Us a Message</h2>
          <p className="text-xs text-muted-foreground mb-6">Fill in the details below and we will reach out promptly.</p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
