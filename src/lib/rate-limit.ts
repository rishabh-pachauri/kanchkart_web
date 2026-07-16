import { db } from "@/lib/db";

export async function rateLimit(key: string, limit = 12, windowSeconds = 60) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);
  const record = await db.rateLimit.findUnique({ where: { key } });

  if (!record || record.resetAt < now) {
    await db.rateLimit.upsert({
      where: { key },
      update: { count: 1, resetAt },
      create: { key, count: 1, resetAt }
    });
    return { ok: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  const updated = await db.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } }
  });

  return { ok: true, remaining: Math.max(0, limit - updated.count) };
}

