import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendAdminNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limited = await rateLimit(`newsletter:${ip}`, 8, 60);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid email." }, { status: 400 });

  await db.notification.create({
    data: {
      title: "Newsletter signup",
      body: parsed.data.email
    }
  });
  await sendAdminNotification("New KanchKart newsletter signup", `<p>${parsed.data.email}</p>`);

  return NextResponse.json({ ok: true });
}

