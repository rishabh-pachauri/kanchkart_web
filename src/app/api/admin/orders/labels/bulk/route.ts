import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, toNumber } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const ids = request.nextUrl.searchParams.get("ids");
  if (!ids) return new NextResponse("Missing ids", { status: 400 });

  let orders;
  if (ids === "all") {
    orders = await db.order.findMany({
      include: { items: true, address: true },
      orderBy: { createdAt: "desc" }
    });
  } else {
    const idList = ids.split(",").map((s) => s.trim()).filter(Boolean);
    orders = await db.order.findMany({
      where: { id: { in: idList } },
      include: { items: true, address: true },
      orderBy: { createdAt: "desc" }
    });
  }

  if (orders.length === 0) return new NextResponse("No orders found", { status: 404 });

  const labelsHtml = orders.map((order) => {
    const trackUrl = `https://kanchkart.com/track-order?orderNumber=${order.orderNumber}`;
    const addressHtml = order.address
      ? `${order.address.line1}<br>${order.address.line2 ? order.address.line2 + "<br>" : ""}<strong>${order.address.city}, ${order.address.state}</strong><br>PIN: ${order.address.postalCode}`
      : "Address on file";
    const itemRows = order.items.map((item) => `
      <tr>
        <td style="padding:1.5mm 2mm;border-bottom:1px solid #e2e8f0;">${item.name}</td>
        <td style="padding:1.5mm 2mm;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;">${item.quantity}</td>
        <td style="padding:1.5mm 2mm;border-bottom:1px solid #e2e8f0;text-align:right;">${formatPrice(toNumber(item.lineTotal))}</td>
      </tr>`).join("");

    return `
    <div class="label-page">
      <div class="label">
        <div class="header">
          <div class="brand">
            <div class="brand-icon">K</div>
            <div>
              <div class="brand-name">KanchKart</div>
              <div class="brand-sub">Pure Glassware • Firozabad</div>
            </div>
          </div>
          <div>
            <span class="badge">${order.paymentMethod === "COD" ? "CASH ON DELIVERY" : "PREPAID ONLINE"}</span>
            <div class="order-num">#${order.orderNumber}</div>
          </div>
        </div>
        <div class="addresses">
          <div class="from">
            <div class="section-label">SHIP FROM:</div>
            <div class="name-medium">KanchKart</div>
            <div class="addr-text">Mahaveer Nagar, Firozabad<br>U.P. – 283203, India<br>+91 82184 41794</div>
          </div>
          <div>
            <div class="section-label">DELIVER TO:</div>
            <div class="name-large">${order.customerName}</div>
            <div class="addr-to">${addressHtml}</div>
            <div class="phone">📞 ${order.customerPhone}</div>
          </div>
        </div>
        <div class="contents">
          <div class="contents-header">
            <span class="section-label">CONTENTS</span>
            <span class="section-label">${formatDate(order.createdAt)}</span>
          </div>
          <table>
            <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
        </div>
        <div class="footer">
          <div>
            <div class="awb">AWB: <strong>${order.trackingNumber || order.orderNumber}</strong></div>
            <div class="barcode">||||| ||| || ||||| ||</div>
            <div class="barcode-num">${order.trackingNumber || order.orderNumber}</div>
          </div>
          <div class="qr-box">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(trackUrl)}" width="80" height="80" alt="QR" />
            <div class="qr-label">Scan to Track</div>
          </div>
        </div>
      </div>
    </div>`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Bulk Labels (${orders.length})</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: Arial, sans-serif; font-size: 9px;
      background: #f1f5f9; color: #0f172a;
      display: flex; flex-direction: column; align-items: center;
      padding: 12px; gap: 16px;
    }

    #toolbar {
      width: 105mm; display: flex; align-items: center;
      justify-content: space-between;
    }
    #toolbar a { font-size: 12px; color: #475569; text-decoration: none; font-weight: 600; }
    #toolbar button {
      background: #f59e0b; border: none; border-radius: 8px;
      padding: 7px 16px; font-size: 12px; font-weight: 700; cursor: pointer; color: #0f172a;
    }
    #toolbar button:hover { background: #fbbf24; }

    .label-page { display: block; }

    .label {
      width: 105mm; min-height: 142mm; background: #fff;
      border: 1.5px solid #0f172a; padding: 5mm;
      display: flex; flex-direction: column; gap: 3mm;
    }

    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #0f172a; padding-bottom: 2.5mm; }
    .brand { display: flex; align-items: center; gap: 2.5mm; }
    .brand-icon { width: 8mm; height: 8mm; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; border-radius: 2px; }
    .brand-name { font-weight: 900; font-size: 13px; letter-spacing: -0.3px; }
    .brand-sub { font-size: 7px; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-top: 1px; }
    .badge { background: #dcfce7; border: 1px solid #4ade80; color: #14532d; font-weight: 800; font-size: 7px; text-transform: uppercase; letter-spacing: 0.6px; padding: 1mm 2.5mm; border-radius: 2px; display: block; text-align: center; margin-bottom: 1mm; }
    .order-num { font-weight: 800; font-size: 8px; font-family: monospace; text-align: right; }
    .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; border-bottom: 1.5px solid #0f172a; padding-bottom: 2.5mm; }
    .from { border-right: 1px solid #cbd5e1; padding-right: 2mm; }
    .section-label { font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-size: 8px; margin-bottom: 1mm; }
    .name-large { font-weight: 900; font-size: 10px; margin-bottom: 1mm; }
    .name-medium { font-weight: 700; font-size: 8.5px; margin-bottom: 0.5mm; }
    .addr-text { color: #475569; line-height: 1.6; }
    .addr-to { color: #1e293b; line-height: 1.6; }
    .phone { font-weight: 800; margin-top: 1mm; }
    .contents { border-bottom: 1.5px solid #0f172a; padding-bottom: 2.5mm; }
    .contents-header { display: flex; justify-content: space-between; margin-bottom: 1.5mm; }
    table { width: 100%; border-collapse: collapse; font-size: 8px; }
    thead tr { background: #f1f5f9; border-bottom: 1px solid #cbd5e1; }
    th { padding: 1.5mm 2mm; font-weight: 700; }
    th:first-child { text-align: left; }
    th:nth-child(2) { text-align: center; }
    th:last-child { text-align: right; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; }
    .awb { font-size: 7px; color: #64748b; margin-bottom: 1mm; }
    .awb strong { font-family: monospace; }
    .barcode { font-family: monospace; font-size: 22px; letter-spacing: 3px; line-height: 1; color: #0f172a; }
    .barcode-num { font-size: 7px; text-align: center; margin-top: 1px; font-family: monospace; color: #475569; }
    .qr-box { border: 1px solid #cbd5e1; padding: 2mm; border-radius: 2px; text-align: center; }
    .qr-label { font-size: 6px; font-weight: 700; text-transform: uppercase; margin-top: 1mm; font-family: monospace; }

    @media print {
      @page { size: 105mm 148mm; margin: 0; }
      body { background: white; padding: 3mm; gap: 0; }
      #toolbar { display: none; }
      .label { border: 1.5px solid #000; }
      .label-page { page-break-after: always; break-after: page; }
      .label-page:last-child { page-break-after: avoid; break-after: avoid; }
    }
  </style>
</head>
<body>
  <div id="toolbar">
    <a href="/admin/orders">← Back to Orders</a>
    <button onclick="window.print()">🖨 Print All (${orders.length} Labels)</button>
  </div>
  ${labelsHtml}
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
