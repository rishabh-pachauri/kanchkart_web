import { db } from "@/lib/db";

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  defaultShippingCost: number;
  freeShippingThreshold: number;
  gstRate: number;
  gstin: string;
  serviceArea: string;
  codEnabled: boolean;
  razorpayEnabled: boolean;
  codFee: number;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "KanchKart",
  supportEmail: "support@kanchkart.com",
  supportPhone: "+91 98765 43210",
  defaultShippingCost: 50,
  freeShippingThreshold: 1999,
  gstRate: 18,
  gstin: "27AAAAA0000A1Z5",
  serviceArea: "All India",
  codEnabled: true,
  razorpayEnabled: true,
  codFee: 0
};

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: "store_settings" }
    });

    if (!setting || !setting.value) {
      return DEFAULT_STORE_SETTINGS;
    }

    const val = setting.value as unknown as Partial<StoreSettings>;
    return {
      ...DEFAULT_STORE_SETTINGS,
      ...val
    };
  } catch (error) {
    console.error("[SETTINGS ERROR - getStoreSettings]:", error);
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const updated: StoreSettings = {
    ...current,
    ...newSettings,
    defaultShippingCost: Number(newSettings.defaultShippingCost ?? current.defaultShippingCost),
    freeShippingThreshold: Number(newSettings.freeShippingThreshold ?? current.freeShippingThreshold),
    gstRate: Number(newSettings.gstRate ?? current.gstRate),
    codFee: Number(newSettings.codFee ?? current.codFee)
  };

  await db.siteSetting.upsert({
    where: { key: "store_settings" },
    update: { value: updated as unknown as object },
    create: { key: "store_settings", value: updated as unknown as object }
  });

  return updated;
}

export async function calculateShippingCost(subtotal: number): Promise<number> {
  const settings = await getStoreSettings();
  if (subtotal >= settings.freeShippingThreshold) {
    return 0;
  }
  return settings.defaultShippingCost;
}
