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

export default async function PrintBulkLabelsPage({
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
      <style>{`
        @media print {
          @page { size: 105mm 148mm; margin: 3mm; }
          body { margin: 0; padding: 0; background: white; }
          #print-toolbar { display: none !important; }
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

      {/* Toolbar — hidden when printing */}
      <div
        id="print-toolbar"
        style={{
          maxWidth: "115mm",
          margin: "0 auto",
          padding: "12px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px"
        }}
      >
        <Link
          href="/admin/orders"
          style={{ fontSize: "12px", color: "#475569", textDecoration: "none", fontWeight: 600 }}
        >
          ← Back to Orders
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, background: "#e2e8f0", padding: "4px 10px", borderRadius: "6px", color: "#475569" }}>
            {orders.length} Label{orders.length !== 1 ? "s" : ""}
          </span>
          <PrintLabelButton />
        </div>
      </div>

      {/* Labels — each in its own page-break div */}
      {orders.map((order) => {
        const trackUrl = `https://kanchkart.com/track-order?orderNumber=${order.orderNumber}`;
        return (
          <div key={order.id} className="kk-label-page" style={{ marginBottom: "20px" }}>
            <div
              style={{
                width: "99mm",
                minHeight: "142mm",
                margin: "0 auto",
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #0f172a", paddingBottom: "2.5mm" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "2.5mm" }}>
                  <div style={{ width: "7mm", height: "7mm", background: "#0f172a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "11px", borderRadius: "2px" }}>K</div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: "13px", letterSpacing: "-0.3px" }}>KanchKart</div>
                    <div style={{ fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.8px", color: "#64748b" }}>Pure Glassware • Firozabad</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ background: "#dcfce7", border: "1px solid #4ade80", color: "#14532d", fontWeight: 800, fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.6px", padding: "1mm 2.5mm", borderRadius: "2px", display: "inline-block" }}>
                    {order.paymentMethod === "COD" ? "CASH ON DELIVERY" : "PREPAID ONLINE"}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "8px", marginTop: "1mm", fontFamily: "monospace" }}>#{order.orderNumber}</div>
                </div>
              </div>

              {/* Addresses */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3mm", borderBottom: "1.5px solid #0f172a", paddingBottom: "2.5mm" }}>
                <div style={{ borderRight: "1px solid #cbd5e1", paddingRight: "2mm" }}>
                  <div style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", marginBottom: "1mm" }}>SHIP FROM:</div>
                  <div style={{ fontWeight: 700, fontSize: "8.5px", marginBottom: "0.5mm" }}>KanchKart</div>
                  <div style={{ color: "#475569", lineHeight: 1.5 }}>
                    Mahaveer Nagar, Firozabad<br />
                    U.P. – 283203, India<br />
                    +91 82184 41794
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", marginBottom: "1mm" }}>DELIVER TO:</div>
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
                        <td style={{ textAlign: "right", padding: "1mm 1.5mm" }}>{formatPrice(toNumber(item.lineTotal))}</td>
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
                  <div style={{ fontSize: "6px", fontWeight: 700, textTransform: "uppercase", marginTop: "0.5mm", fontFamily: "monospace" }}>Scan to Track</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
