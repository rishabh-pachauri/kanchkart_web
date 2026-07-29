import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintLabelButton } from "@/components/admin/print-label-button";
import { Barcode } from "@/components/ui/barcode";
import { QRCode } from "@/components/ui/qr-code";
import { db } from "@/lib/db";
import { formatPrice, toNumber } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Print Shipping Label | KanchKart Admin"
};

export default async function AdminShippingLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      address: true
    }
  });

  if (!order) notFound();

  const trackUrl = `https://kanchkart.com/track-order?orderNumber=${order.orderNumber}`;

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-12 text-slate-950 font-sans print:p-0 print:bg-white">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="mx-auto max-w-3xl mb-8 flex items-center justify-between print:hidden">
        <Link href={`/admin/orders/${order.id}`} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
          ← Back to Order #{order.orderNumber}
        </Link>
        <PrintLabelButton />
      </div>

      {/* Printable Shipping Label Container */}
      <div className="mx-auto max-w-3xl rounded-2xl border-2 border-slate-900 bg-white p-8 shadow-2xl print:max-w-none print:rounded-none print:border-2 print:border-black print:p-6 print:shadow-none">
        {/* Label Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold font-serif text-xl">
              K
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-950">KanchKart</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">Pure Glassware • Firozabad HQ</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block rounded-md bg-emerald-100 border border-emerald-400 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-900">
              PREPAID ONLINE
            </span>
            <p className="mt-1 text-xs font-mono font-bold text-slate-800">ORDER #{order.orderNumber}</p>
          </div>
        </div>

        {/* Sender vs Recipient Address Grid */}
        <div className="grid grid-cols-2 gap-6 border-b-2 border-slate-900 py-6">
          {/* FROM: Sender */}
          <div className="border-r border-slate-300 pr-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">SHIP FROM (SENDER):</span>
            <p className="mt-1 font-serif text-base font-bold text-slate-950">KanchKart Headquarters</p>
            <p className="text-xs leading-relaxed text-slate-700 mt-1">
              Mahaveer Nagar, Firozabad<br />
              Uttar Pradesh - 283203, India<br />
              <strong>Phone:</strong> +91 82184 41794<br />
              <strong>Email:</strong> kanchkart@gmail.com
            </p>
          </div>

          {/* TO: Recipient */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">DELIVER TO (RECIPIENT):</span>
            <p className="mt-1 font-serif text-lg font-bold text-slate-950">{order.customerName}</p>
            <p className="text-xs leading-relaxed text-slate-800 mt-1">
              {order.address ? (
                <>
                  {order.address.line1}<br />
                  {order.address.line2 ? <>{order.address.line2}<br /></> : null}
                  <strong>{order.address.city}, {order.address.state} - {order.address.postalCode}</strong><br />
                  {order.address.country}
                </>
              ) : (
                <>Standard Customer Delivery Address</>
              )}
            </p>
            <p className="text-xs font-bold text-slate-950 mt-2">
              📞 Phone: {order.customerPhone}
            </p>
          </div>
        </div>

        {/* Package Contents Table */}
        <div className="py-6 border-b-2 border-slate-900">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">PACKAGE CONTENTS SUMMARY</span>
            <span className="text-xs font-semibold text-slate-600">Date: {formatDate(order.createdAt)}</span>
          </div>

          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-[10px] text-slate-700">
              <tr>
                <th className="p-2 border-r border-slate-300">SKU</th>
                <th className="p-2 border-r border-slate-300">Product Name</th>
                <th className="p-2 border-r border-slate-300 text-center">Qty</th>
                <th className="p-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="p-2 font-mono border-r border-slate-200 font-bold">{item.sku}</td>
                  <td className="p-2 font-semibold border-r border-slate-200">{item.name}</td>
                  <td className="p-2 text-center border-r border-slate-200 font-bold">{item.quantity}</td>
                  <td className="p-2 text-right font-semibold">{formatPrice(toNumber(item.lineTotal))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Authentic QR Code & Barcode Verification Footer */}
        <div className="pt-6 flex items-center justify-between gap-6">
          <div>
            <p className="text-[11px] text-slate-500">Courier Partner: <strong className="text-slate-900">{order.courierPartner || "Standard Express Surface"}</strong></p>
            <p className="text-[11px] text-slate-500 mb-2">AWB Tracking: <strong className="text-slate-900 font-mono">{order.trackingNumber || order.orderNumber}</strong></p>

            {/* Barcode Component */}
            <Barcode value={order.trackingNumber || order.orderNumber} className="w-48" />
          </div>

          {/* Authentic Scannable SVG QR Code */}
          <div className="flex flex-col items-center border border-slate-300 p-2 rounded-xl bg-white shadow-sm">
            <QRCode value={trackUrl} size={100} />
            <span className="text-[9px] font-mono font-bold text-slate-700 mt-1 uppercase">Scan to Track</span>
          </div>
        </div>
      </div>
    </div>
  );
}
