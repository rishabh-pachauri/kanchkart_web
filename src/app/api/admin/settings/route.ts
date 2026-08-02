import { NextRequest, NextResponse } from "next/server";
import { getStoreSettings, updateStoreSettings, StoreSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const updated = await updateStoreSettings(body as Partial<StoreSettings>);
    return NextResponse.json({
      success: true,
      message: "Store settings updated successfully!",
      settings: updated
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
