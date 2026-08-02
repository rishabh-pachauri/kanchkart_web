import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { gstIncluded, toNumber } from "@/lib/money";
import { calculateShippingCost } from "@/lib/settings";
import { checkoutSchema } from "@/lib/validators";

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

  const productIds = parsed.items.map((i) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { variants: true }
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const rows = parsed.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error(`Product not found or inactive: ${item.productId}`);

    const variant = item.variantId
      ? product.variants.find((v) => v.id === item.variantId)
      : null;

    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${availableStock}`);
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
  const shippingTotal = await calculateShippingCost(subtotal);
  const coupon = parsed.couponCode
    ? await db.coupon.findFirst({
        where: {
          code: parsed.couponCode.toUpperCase(),
          isActive: true,
          OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
          AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }]
        }
      })
    : null;

  const minOrderVal = coupon?.minOrderValue ? toNumber(coupon.minOrderValue) : 0;
  const isCouponEligible = coupon && subtotal >= minOrderVal;

  let discountTotal = 0;
  if (isCouponEligible && coupon) {
    if (coupon.type === "PERCENTAGE") {
      discountTotal = (subtotal * toNumber(coupon.value)) / 100;
      if (coupon.maxDiscount) {
        discountTotal = Math.min(discountTotal, toNumber(coupon.maxDiscount));
      }
    } else {
      discountTotal = toNumber(coupon.value);
    }
  }

  const validUserId = session?.user?.id
    ? (await db.user.findUnique({ where: { id: session.user.id } }))
      ? session.user.id
      : undefined
    : undefined;

  const order = await db.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: {
        userId: validUserId,
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
        userId: validUserId,
        customerEmail: parsed.address.email,
        customerName: parsed.address.name,
        customerPhone: parsed.address.phone,
        status: OrderStatus.ORDER_RECEIVED,
        paymentMethod: parsed.paymentMethod as PaymentMethod,
        paymentStatus: PaymentStatus.PENDING,
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
            sku: row.product.sku,
            unitPrice: row.unitPrice,
            quantity: row.input.quantity,
            lineTotal: row.lineTotal,
            gstPercent: row.gstPercent
          }))
        },
        payments: {
          create: {
            method: parsed.paymentMethod as PaymentMethod,
            amount: Math.max(0, subtotal + shippingTotal - discountTotal),
            status: PaymentStatus.PENDING
          }
        }
      },
      include: {
        items: true,
        address: true,
        payments: true,
        trackingEvents: true
      }
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

    return saved;
  });

  return order;
}
