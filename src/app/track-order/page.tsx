import { TrackOrderClient } from "@/components/track-order-client";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Track Order",
  description: "Track your KanchKart order status, courier partner, and delivery timeline."
});

export default async function TrackOrderPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  return (
    <section className="container max-w-3xl py-10">
      <p className="text-sm font-semibold uppercase text-gold">Track order</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Follow your glassware home</h1>
      <div className="mt-8">
        <TrackOrderClient defaultOrderNumber={params.orderNumber} />
      </div>
    </section>
  );
}

