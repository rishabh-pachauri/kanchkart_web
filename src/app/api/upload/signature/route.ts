import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signedUploadParams } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/security";

const schema = z.object({
  folder: z.string().trim().min(1).max(80),
  publicId: z.string().trim().max(120).optional()
});

export async function POST(request: NextRequest) {
  await requireAdmin();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });

  return NextResponse.json(signedUploadParams(parsed.data.folder, parsed.data.publicId));
}

