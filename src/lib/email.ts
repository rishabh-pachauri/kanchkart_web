import { Resend } from "resend";
import type { Order } from "@prisma/client";
import { env } from "@/lib/env";
import { formatPrice } from "@/lib/money";

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export async function sendOrderConfirmation(order: Order) {
  if (!resend) return { skipped: true };

  return resend.emails.send({
    from: env.emailFrom,
    to: order.customerEmail,
    subject: `KanchKart order ${order.orderNumber} confirmed`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#24211D">
        <h1 style="font-family:Georgia,serif">Thank you for your order</h1>
        <p>We received your KanchKart order <strong>${order.orderNumber}</strong>.</p>
        <p>Total: <strong>${formatPrice(order.grandTotal)}</strong></p>
        <p>Track anytime at <a href="${env.appUrl}/track-order">${env.appUrl}/track-order</a>.</p>
      </div>
    `
  });
}

export async function sendAdminNotification(subject: string, body: string) {
  if (!resend || !env.adminNotificationEmail) return { skipped: true };

  return resend.emails.send({
    from: env.emailFrom,
    to: env.adminNotificationEmail,
    subject,
    html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#24211D">${body}</div>`
  });
}

