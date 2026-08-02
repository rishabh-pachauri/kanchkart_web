"use client";

import { useState, useEffect } from "react";
import { StoreSettings, DEFAULT_STORE_SETTINGS } from "@/lib/settings";
import { 
  Truck, 
  Store, 
  CreditCard, 
  Receipt, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  IndianRupee,
  ShieldCheck,
  Percent
} from "lucide-react";

export function AdminSettingsClient() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      const data = await res.json();

      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSettings(data.settings);
        setMessage({ type: "success", text: "Settings updated successfully! Shipping & store rates are now live." });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update settings." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error while saving settings." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mr-3" />
        <span className="text-slate-600 font-medium">Loading store settings...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12">
      {/* Top Banner & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-7 h-7 text-amber-300" />
            Store Settings & Configuration
          </h1>
          <p className="text-emerald-100 text-sm mt-1">
            Manage shipping costs, free delivery thresholds, payment methods, GST, and contact info.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="font-medium text-sm">{message.text}</span>
        </div>
      )}

      {/* Grid of Settings Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Shipping & Logistics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Shipping & Delivery</h3>
              <p className="text-xs text-slate-500">Set default shipping fees and free delivery limits</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                <span>Default Shipping Cost (₹)</span>
                <span className="text-xs font-normal text-slate-500">Standard delivery charge</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={settings.defaultShippingCost}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultShippingCost: Number(e.target.value) })
                  }
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900"
                  placeholder="50"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Charged on orders below the free shipping threshold.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                <span>Free Shipping Order Threshold (₹)</span>
                <span className="text-xs font-normal text-slate-500">Minimum order value</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={settings.freeShippingThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                  }
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900"
                  placeholder="1999"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Orders equal to or above ₹{settings.freeShippingThreshold} receive FREE Shipping!
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Service Area Coverage
              </label>
              <select
                value={settings.serviceArea}
                onChange={(e) => setSettings({ ...settings, serviceArea: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900 bg-white"
              >
                <option value="All India">All India Delivery</option>
                <option value="Selected Metro Cities">Selected Metro Cities Only</option>
                <option value="Statewide">Statewide</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Store & Contact Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Store Information</h3>
              <p className="text-xs text-slate-500">Public store name and customer support contacts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900"
                placeholder="KanchKart"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Customer Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900"
                placeholder="support@kanchkart.com"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Support Phone Number
              </label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        {/* 3. Payment Methods */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment Gateways</h3>
              <p className="text-xs text-slate-500">Configure online & COD payment options</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl bg-slate-50">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-sm text-slate-900">Razorpay Online Payments</p>
                  <p className="text-xs text-slate-500">UPI, Credit/Debit Cards, Net Banking</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.razorpayEnabled}
                onChange={(e) => setSettings({ ...settings, razorpayEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl bg-slate-50">
              <div className="flex items-center gap-3">
                <IndianRupee className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-sm text-slate-900">Cash on Delivery (COD)</p>
                  <p className="text-xs text-slate-500">Allow customers to pay upon delivery</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.codEnabled}
                onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                COD Convenience Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={settings.codFee}
                onChange={(e) => setSettings({ ...settings, codFee: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-900"
                placeholder="0"
              />
              <p className="text-xs text-slate-500 mt-1">Set to 0 for free COD.</p>
            </div>
          </div>
        </div>

        {/* 4. GST & Invoicing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Taxes & GST</h3>
              <p className="text-xs text-slate-500">Tax rate and invoicing details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                <span>Default GST Rate (%)</span>
                <Percent className="w-4 h-4 text-slate-400" />
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.gstRate}
                onChange={(e) => setSettings({ ...settings, gstRate: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium text-slate-900"
                placeholder="18"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Included in product prices.</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                GSTIN Registration Number
              </label>
              <input
                type="text"
                value={settings.gstin || ""}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium text-slate-900 uppercase"
                placeholder="27AAAAA0000A1Z5"
              />
              <p className="text-xs text-slate-500 mt-1">Printed on order tax invoices.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Action Footer */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50 text-base"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving Settings...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save All Settings
            </>
          )}
        </button>
      </div>
    </form>
  );
}
