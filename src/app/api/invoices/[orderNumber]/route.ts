import PDFDocument from "pdfkit";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";

async function renderInvoicePdf(orderNumber: string) {
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true, address: true, invoice: true }
  });
  if (!order) return null;

  const doc = new PDFDocument({ size: "A4", margin: 48 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(24).text("KanchKart GST Invoice", { align: "left" });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Invoice: ${order.invoice?.invoiceNumber || order.orderNumber}`);
  doc.text(`Order: ${order.orderNumber}`);
  doc.text(`Date: ${order.createdAt.toLocaleDateString("en-IN")}`);
  doc.moveDown();
  doc.fontSize(12).text(`Bill To: ${order.customerName}`);
  doc.fontSize(10).text(order.customerEmail);
  doc.text(order.customerPhone);
  if (order.address) {
    doc.text(`${order.address.line1}${order.address.line2 ? `, ${order.address.line2}` : ""}`);
    doc.text(`${order.address.city}, ${order.address.state} ${order.address.postalCode}`);
  }
  doc.moveDown();
  doc.fontSize(12).text("Items");
  order.items.forEach((item) => {
    doc.fontSize(10).text(`${item.name} (${item.sku}) x ${item.quantity} - ${formatPrice(item.lineTotal)}`);
  });
  doc.moveDown();
  doc.text(`Subtotal: ${formatPrice(order.subtotal)}`, { align: "right" });
  doc.text(`Shipping: ${formatPrice(order.shippingTotal)}`, { align: "right" });
  doc.text(`GST included: ${formatPrice(order.gstTotal)}`, { align: "right" });
  doc.fontSize(14).text(`Total: ${formatPrice(order.grandTotal)}`, { align: "right" });
  doc.end();

  return { order, buffer: await done };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const session = await auth();
  const { orderNumber } = await params;
  const rendered = await renderInvoicePdf(orderNumber);
  if (!rendered) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });

  const email = request.nextUrl.searchParams.get("email");
  const allowed =
    session?.user?.role === "ADMIN" ||
    rendered.order.userId === session?.user?.id ||
    (email && email === rendered.order.customerEmail);

  if (!allowed) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  return new NextResponse(new Uint8Array(rendered.buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${rendered.order.orderNumber}.pdf"`
    }
  });
}
