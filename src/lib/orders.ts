import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { gstIncluded, shippingFor, toNumber } from "@/lib/money";
import { checkoutSchema } from "@/lib/validators";
import { sendAdminNotification, sendOrderConfirmation } from "@/lib/email";

export async function nextOrderNumber(tx: Prisma.TransactionClient) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await tx.order.count({
    where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
  });
  return `KK-${today}-${String(count + 1001).padStart(4, "0")}`;
}

export async function createOrderFromCheckout(input: unknown) {
  const parsed = checkoutSchema.parse(input);
  const session = await auth();

  const order = await db.$transaction(async (tx) => {
    const ids = parsed.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: ids }, isActive: true },
      include: { variants: true }
    });

    const productMap = new Map(products.map((product) => [product.id, product]));
    const rows = parsed.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error("A product in your cart is no longer available.");
      const variant = item.variantId
        ? product.variants.find((candidate) => candidate.id === item.variantId)
        : null;
      const availableStock = variant ? variant.stock : product.stock;
      if (availableStock < item.quantity) {
        throw new Error(`${product.name} has only ${availableStock} item(s) in stock.`);
      }

      const unitPrice = toNumber(variant?.price ?? product.price);
      const lineTotal = unitPrice * item.quantity;
      const gstPercent = toNumber(product.gstPercent);

      return {
        input: item,
        product,
        variant,
        unitPrice,
        lineTotal,
        gstPercent,
        gstTotal: gstIncluded(lineTotal, gstPercent)
      };
    });

    const subtotal = rows.reduce((sum, row) => sum + row.lineTotal, 0);
    const gstTotal = rows.reduce((sum, row) => sum + row.gstTotal, 0);
    const shippingTotal = shippingFor(subtotal);
    const coupon = parsed.couponCode
      ? await tx.coupon.findFirst({
          where: {
            code: parsed.couponCode.toUpperCase(),
            isActive: true,
            OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
            AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }]
          }
        })
      : null;

    const discountTotal = coupon
      ? Math.min(
          coupon.maxDiscount ? toNumber(coupon.maxDiscount) : Number.MAX_SAFE_INTEGER,
          coupon.type === "PERCENTAGE"
            ? (subtotal * toNumber(coupon.value)) / 100
            : toNumber(coupon.value)
        )
      : 0;

    const address = await tx.address.create({
      data: {
        userId: session?.user?.id,
        guestEmail: session?.user?.id ? undefined : parsed.address.email,
        name: parsed.address.name,
        phone: parsed.address.phone,
        line1: parsed.address.line1,
        line2: parsed.address.line2,
        city: parsed.address.city,
        state: parsed.address.state,
        postalCode: parsed.address.postalCode,
        country: parsed.address.country,
        landmark: parsed.address.landmark
      }
    });

    const orderNumber = await nextOrderNumber(tx);
    const saved = await tx.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id,
        customerEmail: parsed.address.email,
        customerName: parsed.address.name,
        customerPhone: parsed.address.phone,
        status: OrderStatus.ORDER_RECEIVED,
        paymentMethod: parsed.paymentMethod as PaymentMethod,
        paymentStatus:
          parsed.paymentMethod === "COD" ? PaymentStatus.AUTHORIZED : PaymentStatus.PENDING,
        subtotal,
        discountTotal,
        shippingTotal,
        gstTotal,
        grandTotal: Math.max(0, subtotal + shippingTotal - discountTotal),
        couponId: coupon?.id,
        addressId: address.id,
        items: {
          create: rows.map((row) => ({
            productId: row.product.id,
            variantId: row.variant?.id,
            name: row.product.name,
            sku: row.variant?.sku ?? row.product.sku,
            quantity: row.input.quantity,
            unitPrice: row.unitPrice,
            gstPercent: row.gstPercent,
            lineTotal: row.lineTotal
          }))
        },
        payments: {
          create: {
            method: parsed.paymentMethod as PaymentMethod,
            status:
              parsed.paymentMethod === "COD" ? PaymentStatus.AUTHORIZED : PaymentStatus.PENDING,
            amount: Math.max(0, subtotal + shippingTotal - discountTotal)
          }
        },
        trackingEvents: {
          create: {
            status: OrderStatus.ORDER_RECEIVED,
            title: "Order received",
            description: "Your KanchKart order has been created."
          }
        }
      },
      include: { items: true, payments: true }
    });

    for (const row of rows) {
      if (row.variant) {
        await tx.productVariant.update({
          where: { id: row.variant.id },
          data: { stock: { decrement: row.input.quantity } }
        });
      } else {
        await tx.product.update({
          where: { id: row.product.id },
          data: { stock: { decrement: row.input.quantity } }
        });
      }
    }

    if (coupon) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } }
      });
    }

    return saved;
  });

  await Promise.allSettled([
    sendOrderConfirmation(order),
    sendAdminNotification(
      `New KanchKart order ${order.orderNumber}`,
      `<p>${order.customerName} placed an order worth <strong>${order.grandTotal}</strong>.</p>`
    )
  ]);

  return order;
}

