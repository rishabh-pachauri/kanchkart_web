import { Resend } from "resend";
import type { Order } from "@prisma/client";
import { env } from "@/lib/env";
import { formatPrice } from "@/lib/money";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY || env.resendApiKey;
  return apiKey ? new Resend(apiKey) : null;
}

export async function sendOrderConfirmation(order: Order) {
  const resend = getResendClient();
  if (!resend) return { skipped: true };

  const sender = process.env.EMAIL_FROM || env.emailFrom || "KanchKart <onboarding@resend.dev>";

  return resend.emails.send({
    from: sender,
    to: order.customerEmail,
    subject: `KanchKart Order ${order.orderNumber} Confirmed`,
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
  const resend = getResendClient();
  if (!resend || !env.adminNotificationEmail) return { skipped: true };

  const sender = process.env.EMAIL_FROM || env.emailFrom || "KanchKart <onboarding@resend.dev>";

  return resend.emails.send({
    from: sender,
    to: env.adminNotificationEmail,
    subject,
    html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#24211D">${body}</div>`
  });
}
