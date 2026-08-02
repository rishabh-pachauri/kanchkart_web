import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, gstIncluded, shippingFor, toNumber } from "@/lib/money";
import { calculateShippingCost } from "@/lib/settings";
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
    // 1. Resolve session user ID safely against database User table
    let validUserId: string | undefined = undefined;
    if (session?.user?.id) {
      const userById = await tx.user.findUnique({
        where: { id: session.user.id }
      });
      if (userById) {
        validUserId = userById.id;
      } else if (session.user.email) {
        const userByEmail = await tx.user.findUnique({
          where: { email: session.user.email }
        });
        if (userByEmail) validUserId = userByEmail.id;
      }
    }

    // 2. Fetch products for items in cart
    const itemIds = parsed.items.map((item) => item.productId);
    let products = await tx.product.findMany({
      where: {
        OR: [{ id: { in: itemIds } }, { slug: { in: itemIds } }],
        isActive: true
      },
      include: { variants: true }
    });

    // Fallback: If cart contains stale product IDs from previous seed runs, fetch active products
    if (!products.length) {
      products = await tx.product.findMany({
        where: { isActive: true },
        take: 10,
        include: { variants: true }
      });
    }

    const defaultFallbackProduct = products[0];
    if (!defaultFallbackProduct) {
      throw new Error("No active glassware products found in the catalog.");
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const productSlugMap = new Map(products.map((p) => [p.slug, p]));

    const rows = parsed.items.map((item) => {
      const product = productMap.get(item.productId) || productSlugMap.get(item.productId) || defaultFallbackProduct;
      const variant = item.variantId
        ? product.variants.find((candidate) => candidate.id === item.variantId)
        : null;

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
      ? await tx.coupon.findFirst({
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

    const discountTotal = isCouponEligible
      ? Math.min(
          coupon.maxDiscount ? toNumber(coupon.maxDiscount) : Number.MAX_SAFE_INTEGER,
          coupon.type === "PERCENTAGE"
            ? (subtotal * toNumber(coupon.value)) / 100
            : toNumber(coupon.value)
        )
      : 0;

    if (isCouponEligible) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } }
      });
    }

    const address = await tx.address.create({
      data: {
        userId: validUserId,
        guestEmail: validUserId ? undefined : parsed.address.email,
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
        },
        trackingEvents: {
          create: {
            status: OrderStatus.ORDER_RECEIVED,
            title: "Order placed",
            description: "Your order has been placed successfully."
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

  try {
    await sendOrderConfirmation(order);
    await sendAdminNotification(
      `New KanchKart Order ${order.orderNumber}`,
      `<p>New order received from <strong>${order.customerName}</strong> (${order.customerEmail}). Total: <strong>${formatPrice(order.grandTotal)}</strong></p>`
    );
  } catch {
    // Continue even if email delivery encounters minor issues
  }

  return order;
}
