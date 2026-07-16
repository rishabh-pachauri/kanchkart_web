import type { Decimal } from "@prisma/client/runtime/library";

export function toNumber(value: Decimal | number | string | null | undefined) {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value);
}

export function formatPrice(value: Decimal | number | string | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(toNumber(value));
}

export function paise(value: Decimal | number | string) {
  return Math.round(toNumber(value) * 100);
}

export function shippingFor(subtotal: number) {
  return subtotal >= 1999 ? 0 : 99;
}

export function gstIncluded(lineTotal: number, gstPercent: number) {
  return Number(((lineTotal * gstPercent) / (100 + gstPercent)).toFixed(2));
}
