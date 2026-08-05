import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintLabelButton } from "@/components/admin/print-label-button";
import { Barcode } from "@/components/ui/barcode";
import { QRCode } from "@/components/ui/qr-code";
import { db } from "@/lib/db";
import { formatPrice, toNumber } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Bulk Shipping Labels | KanchKart Admin"
};

export default async function AdminBulkShippingLabelsPage({
  searchParams
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  if (!ids) notFound();

  let orders;
  if (ids === "all") {
    orders = await db.order.findMany({
      include: { items: true, address: true },
      orderBy: { createdAt: "desc" }
    });
  } else {
    const idList = ids.split(",").map((s) => s.trim()).filter(Boolean);
    if (idList.length === 0) notFound();
    orders = await db.order.findMany({
      where: { id: { in: idList } },
      include: { items: true, address: true },
      orderBy: { createdAt: "desc" }
    });
  }

  if (orders.length === 0) notFound();

  return (
    <>
      {/* ── Print-only global styles ── */}
      <style>{`
        @media print {
          /* Make everything invisible */
          * {
            visibility: hidden !important;
          }

          /* Make labels and all their children visible */
          #kk-bulk-labels-root,
          #kk-bulk-labels-root * {
            visibility: visible !important;
          }

          /* Pin labels block to top-left */
          #kk-bulk-labels-root {
            position: fixed;
            top: 0;
            left: 0;
          }

          /* A6 = exactly 1/4 of A4 — one label per page */
          @page {
            size: 105mm 148mm;
            margin: 3mm;
          }

          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          /* Each label breaks onto a new page */
          .kk-label-page {
            page-break-after: always;
            break-after: page;
          }
          .kk-label-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
        }
      `}</style>

      {/* ── Screen toolbar (hidden during print by the style block above) ── */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/orders" className="text-sm font-semibold text-slate-400 hover:text-white">
          ← Back to Admin Orders
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            {orders.length} Label{orders.length !== 1 ? "s" : ""} Ready
          </span>
          <PrintLabelButton />
        </div>
      </div>

      {/* ── Printable Labels ── */}
      <div id="kk-bulk-labels-root" style={{ display: "block" }}>
        {orders.map((order) => {
          const trackUrl = `https://kanchkart.com/track-order?orderNumber=${order.orderNumber}`;
          return (
            <div key={order.id} className="kk-label-page">
              {/* On-screen preview card */}
              <div className="mb-10 rounded-2xl border-2 border-slate-700 bg-white shadow-xl inline-block">
                <LabelContent order={order} trackUrl={trackUrl} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Shared label component ───────────────────────────────────────────────────
type Order = {
  orderNumber: string;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  createdAt: Date;
  courierPartner: string | null;
  trackingNumber: string | null;
  address: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
  } | null;
  items: {
    id: string;
    name: string;
    quantity: number;
    lineTotal: { toNumber(): number } | number | string;
  }[];
};

function LabelContent({ order, trackUrl }: { order: Order; trackUrl: string }) {
  return (
    <div
      style={{
        width: "99mm",
        minHeight: "142mm",
        fontFamily: "Arial, sans-serif",
        fontSize: "9px",
        color: "#0f172a",
        background: "#fff",
        border: "1.5px solid #0f172a",
        padding: "5mm",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "3mm"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1.5px solid #0f172a",
          paddingBottom: "2.5mm"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "2.5mm" }}>
          <div
            style={{
              width: "7mm", height: "7mm",
              background: "#0f172a", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: "11px", borderRadius: "2px"
            }}
          >
            K
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: "13px", letterSpacing: "-0.3px" }}>KanchKart</div>
            <div style={{ fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.8px", color: "#64748b" }}>
              Pure Glassware • Firozabad
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              background: "#dcfce7", border: "1px solid #4ade80", color: "#14532d",
              fontWeight: 800, fontSize: "7px", textTransform: "uppercase",
              letterSpacing: "0.6px", padding: "1mm 2.5mm", borderRadius: "2px",
              display: "inline-block"
            }}
          >
            {order.paymentMethod === "COD" ? "CASH ON DELIVERY" : "PREPAID ONLINE"}
          </div>
          <div style={{ fontWeight: 800, fontSize: "8px", marginTop: "1mm", fontFamily: "monospace" }}>
            #{order.orderNumber}
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3mm",
          borderBottom: "1.5px solid #0f172a", paddingBottom: "2.5mm"
        }}
      >
        <div style={{ borderRight: "1px solid #cbd5e1", paddingRight: "2mm" }}>
          <div style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", marginBottom: "1mm" }}>
            SHIP FROM:
          </div>
          <div style={{ fontWeight: 700, fontSize: "8.5px", marginBottom: "0.5mm" }}>KanchKart</div>
          <div style={{ color: "#475569", lineHeight: 1.5 }}>
            Mahaveer Nagar, Firozabad<br />
            U.P. – 283203, India<br />
            +91 82184 41794
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", marginBottom: "1mm" }}>
            DELIVER TO:
          </div>
          <div style={{ fontWeight: 900, fontSize: "10px", marginBottom: "1mm" }}>{order.customerName}</div>
          <div style={{ color: "#1e293b", lineHeight: 1.5 }}>
            {order.address ? (
              <>
                {order.address.line1}<br />
                {order.address.line2 ? <>{order.address.line2}<br /></> : null}
                <strong>{order.address.city}, {order.address.state}</strong><br />
                PIN: {order.address.postalCode}
              </>
            ) : "Address on file"}
          </div>
          <div style={{ fontWeight: 800, marginTop: "1mm" }}>📞 {order.customerPhone}</div>
        </div>
      </div>

      {/* Items */}
      <div style={{ borderBottom: "1.5px solid #0f172a", paddingBottom: "2.5mm" }}>
        <div style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", marginBottom: "1.5mm", display: "flex", justifyContent: "space-between" }}>
          <span>CONTENTS</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #cbd5e1" }}>
              <th style={{ textAlign: "left", padding: "1mm 1.5mm", fontWeight: 700 }}>Product</th>
              <th style={{ textAlign: "center", padding: "1mm", fontWeight: 700 }}>Qty</th>
              <th style={{ textAlign: "right", padding: "1mm 1.5mm", fontWeight: 700 }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "1mm 1.5mm" }}>{item.name}</td>
                <td style={{ textAlign: "center", padding: "1mm", fontWeight: 700 }}>{item.quantity}</td>
                <td style={{ textAlign: "right", padding: "1mm 1.5mm" }}>
                  {formatPrice(toNumber(item.lineTotal as Parameters<typeof toNumber>[0]))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Barcode + QR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "7px", color: "#64748b", marginBottom: "1mm" }}>
            AWB: <strong style={{ fontFamily: "monospace" }}>{order.trackingNumber || order.orderNumber}</strong>
          </div>
          <Barcode value={order.trackingNumber || order.orderNumber} className="w-36" />
        </div>
        <div style={{ textAlign: "center", border: "1px solid #cbd5e1", padding: "1.5mm", borderRadius: "2px" }}>
          <QRCode value={trackUrl} size={64} />
          <div style={{ fontSize: "6px", fontWeight: 700, textTransform: "uppercase", marginTop: "0.5mm", fontFamily: "monospace" }}>
            Scan to Track
          </div>
        </div>
      </div>
    </div>
  );
}
