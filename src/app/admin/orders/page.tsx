import { AdminOrdersPipeline } from "@/components/admin/admin-orders-pipeline";
import { db } from "@/lib/db";
import { toNumber } from "@/lib/money";

export const metadata = {
  title: "Structured Orders Pipeline | Admin Portal | KanchKart"
};

export default async function AdminOrdersPage() {
  const rawOrders = await db.order.findMany({
    where: {
      paymentStatus: "PAID"
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              media: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const serializedOrders = rawOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    grandTotal: toNumber(o.grandTotal),
    createdAt: o.createdAt.toISOString(),
    courierPartner: o.courierPartner,
    trackingNumber: o.trackingNumber,
    items: o.items.map((i) => ({
      id: i.id,
      name: i.name,
      sku: i.sku,
      quantity: i.quantity,
      unitPrice: toNumber(i.unitPrice),
      lineTotal: toNumber(i.lineTotal),
      image: i.product?.media[0]?.url || "/brand/drinkware.svg"
    }))
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-serif">Order Fulfillment Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Structured order stages: Incoming → To Pack → To Dispatch → In Transit → Delivered
          </p>
        </div>
      </div>

      <AdminOrdersPipeline initialOrders={serializedOrders} />
    </div>
  );
}
