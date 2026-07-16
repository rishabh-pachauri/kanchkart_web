import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({ title: "Order Success" });

export default async function OrderSuccessPage({
  params
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await db.order.findUnique({ where: { orderNumber } });

  return (
    <section className="container max-w-2xl py-16 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-gold" />
      <h1 className="mt-5 font-serif text-5xl font-semibold">Order received</h1>
      <p className="mt-4 text-muted-foreground">
        {order
          ? `Your KanchKart order ${order.orderNumber} for ${formatPrice(order.grandTotal)} is being processed.`
          : `Your KanchKart order ${orderNumber} is being processed.`}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild variant="gold">
          <Link href={`/track-order?orderNumber=${orderNumber}`}>Track order</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </section>
  );
}

