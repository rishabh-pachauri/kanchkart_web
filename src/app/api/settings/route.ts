import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({
      success: true,
      settings: {
        storeName: settings.storeName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        defaultShippingCost: settings.defaultShippingCost,
        freeShippingThreshold: settings.freeShippingThreshold,
        gstRate: settings.gstRate,
        codEnabled: settings.codEnabled,
        razorpayEnabled: settings.razorpayEnabled,
        serviceArea: settings.serviceArea
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load site settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
