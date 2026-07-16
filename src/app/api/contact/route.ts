import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendAdminNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(2000)
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limited = await rateLimit(`contact:${ip}`, 5, 60);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid contact request." }, { status: 400 });

  await sendAdminNotification(
    `KanchKart contact request from ${parsed.data.name}`,
    `<p><strong>Email:</strong> ${parsed.data.email}</p><p>${parsed.data.message}</p>`
  );

  return NextResponse.json({ ok: true });
}

