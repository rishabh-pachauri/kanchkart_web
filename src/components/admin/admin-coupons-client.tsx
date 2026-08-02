"use client";

import { useState } from "react";
import { Plus, Tag, Percent, Trash2, Edit2, CheckCircle, XCircle, AlertCircle, RefreshCw, Lock, Copy, Check, Sparkles, Share2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SerializedCoupon = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
};

export function AdminCouponsClient({ initialCoupons }: { initialCoupons: SerializedCoupon[] }) {
  const [coupons, setCoupons] = useState<SerializedCoupon[]>(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<SerializedCoupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Standard Form State
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Secret 1-Time Coupon State
  const [secretCustomerName, setSecretCustomerName] = useState("");
  const [secretType, setSecretType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [secretValue, setSecretValue] = useState("20");
  const [secretMinOrder, setSecretMinOrder] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [createdSecretCoupon, setCreatedSecretCoupon] = useState<SerializedCoupon | null>(null);

  function generateRandomCodePrefix(prefix = "SECRET") {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${rand}`;
  }

  function openCreateModal() {
    setEditingCoupon(null);
    setCode("");
    setDescription("");
    setType("PERCENTAGE");
    setValue("10");
    setMinOrderValue("0");
    setMaxDiscount("500");
    setUsageLimit("");
    setIsActive(true);
    setError(null);
    setIsModalOpen(true);
  }

  function openSecretModal() {
    setSecretCustomerName("");
    setSecretType("PERCENTAGE");
    setSecretValue("20");
    setSecretMinOrder("0");
    setSecretCode(generateRandomCodePrefix("VIP"));
    setCreatedSecretCoupon(null);
    setError(null);
    setIsSecretModalOpen(true);
  }

  function openEditModal(coupon: SerializedCoupon) {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDescription(coupon.description || "");
    setType(coupon.type);
    setValue(String(coupon.value));
    setMinOrderValue(coupon.minOrderValue !== null ? String(coupon.minOrderValue) : "");
    setMaxDiscount(coupon.maxDiscount !== null ? String(coupon.maxDiscount) : "");
    setUsageLimit(coupon.usageLimit !== null ? String(coupon.usageLimit) : "");
    setIsActive(coupon.isActive);
    setError(null);
    setIsModalOpen(true);
  }

  // Submit Standard Coupon
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      id: editingCoupon?.id,
      code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      type,
      value,
      minOrderValue: minOrderValue || undefined,
      maxDiscount: maxDiscount || undefined,
      usageLimit: usageLimit || undefined,
      isActive
    };

    try {
      const res = await fetch("/api/admin/coupons", {
        method: editingCoupon ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed.");

      if (editingCoupon) {
        setCoupons(coupons.map((c) => (c.id === editingCoupon.id ? { ...c, ...data.coupon, value: Number(data.coupon.value) } : c)));
      } else {
        setCoupons([{ ...data.coupon, value: Number(data.coupon.value) }, ...coupons]);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Submit Secret 1-Time Coupon
  async function handleCreateSecretCoupon(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedSecretCoupon(null);

    const finalCode = secretCode.trim().toUpperCase() || generateRandomCodePrefix("VIP");
    const recipientNote = secretCustomerName.trim()
      ? `1-Time Private Coupon generated for ${secretCustomerName.trim()}`
      : "1-Time Private Personal Coupon";

    const payload = {
      code: finalCode,
      description: recipientNote,
      type: secretType,
      value: secretValue,
      minOrderValue: secretMinOrder || undefined,
      usageLimit: "1", // Strictly 1-time use!
      isActive: true
    };

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate secret coupon.");

      const newCouponObj = { ...data.coupon, value: Number(data.coupon.value) };
      setCoupons([newCouponObj, ...coupons]);
      setCreatedSecretCoupon(newCouponObj);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  }

  async function toggleActive(coupon: SerializedCoupon) {
    try {
      const newStatus = !coupon.isActive;
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, isActive: newStatus })
      });
      if (res.ok) {
        setCoupons(coupons.map((c) => (c.id === coupon.id ? { ...c, isActive: newStatus } : c)));
      }
    } catch {
      // silent
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
      }
    } catch {
      alert("Failed to delete coupon.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2 font-serif">
            <Tag className="h-7 w-7 text-amber-400" />
            <span>Promotions & Offers Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create public promotional discounts or generate 1-time secret coupon codes for specific customers (hidden from public website).
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* 1-Time Secret Coupon Button */}
          <Button
            onClick={openSecretModal}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold gap-2 shadow-lg shadow-purple-600/20"
          >
            <Lock className="h-4 w-4" />
            <span>Generate 1-Time Secret Coupon</span>
          </Button>

          {/* Standard Coupon Button */}
          <Button onClick={openCreateModal} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold gap-2 shadow-lg shadow-amber-500/20">
            <Plus className="h-4 w-4" />
            <span>Create Public Coupon</span>
          </Button>
        </div>
      </div>

      {/* Coupons List Grid */}
      {coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <Percent className="mx-auto h-12 w-12 text-slate-600" />
          <p className="text-slate-400 font-medium">No coupons found in catalog.</p>
          <div className="flex justify-center gap-3">
            <Button onClick={openSecretModal} className="bg-purple-600 text-white font-bold">
              Generate 1-Time Secret Coupon
            </Button>
            <Button onClick={openCreateModal} variant="outline" className="text-amber-400 border-amber-500/40">
              Create Public Coupon
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => {
            const isSecret1Time = coupon.usageLimit === 1;
            const isUsedUp = isSecret1Time && coupon.usedCount >= 1;

            return (
              <div
                key={coupon.id}
                className={`rounded-2xl border p-5 space-y-4 transition-all relative ${
                  isSecret1Time
                    ? isUsedUp
                      ? "border-slate-800 bg-slate-950/60 opacity-50"
                      : "border-purple-500/40 bg-slate-900/90 shadow-md shadow-purple-900/20"
                    : coupon.isActive
                    ? "border-amber-500/30 bg-slate-900/80 hover:border-amber-500/60"
                    : "border-slate-800 bg-slate-950/60 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xl font-extrabold text-amber-400 tracking-wider">
                        {coupon.code}
                      </span>

                      {/* Badges */}
                      {isSecret1Time ? (
                        <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                          <Lock className="w-3 h-3 text-purple-400" />
                          {isUsedUp ? "Used 1-Time" : "Secret 1-Time Code"}
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleActive(coupon)}
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                            coupon.isActive
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {coupon.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" /> Inactive
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {coupon.description && (
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{coupon.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Copy code button */}
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition"
                      title="Copy Coupon Code"
                    >
                      {copiedCode === coupon.code ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                    {!isSecret1Time && (
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition"
                        title="Edit Coupon"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition"
                      title="Delete Coupon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 rounded-xl p-3 border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 font-semibold block uppercase tracking-wider">Discount Rate</span>
                    <span className="text-white font-bold text-sm">
                      {coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block uppercase tracking-wider">Usage</span>
                    <span className={`font-bold ${isSecret1Time ? "text-purple-400" : "text-amber-400"}`}>
                      {coupon.usedCount} / {coupon.usageLimit ? `${coupon.usageLimit} max` : "∞"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block uppercase tracking-wider">Min Purchase</span>
                    <span className="text-slate-300 font-semibold">
                      {coupon.minOrderValue ? `₹${coupon.minOrderValue}` : "No Minimum"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block uppercase tracking-wider">Visibility</span>
                    <span className={`font-semibold ${isSecret1Time ? "text-purple-300" : "text-emerald-400"}`}>
                      {isSecret1Time ? "🔒 Private" : "🌐 Public"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Generate 1-Time Secret Coupon Modal */}
      {isSecretModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-purple-500/30 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 font-serif">
                <Lock className="h-5 w-5 text-purple-400" />
                <span>Generate 1-Time Secret Coupon</span>
              </h2>
              <button
                onClick={() => setIsSecretModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-950/50 border border-rose-800/80 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {createdSecretCoupon ? (
              /* Success View for Generated Secret Coupon */
              <div className="space-y-4 bg-purple-950/30 p-5 rounded-2xl border border-purple-500/40 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-300">Secret 1-Time Coupon Created</p>
                  <p className="text-2xl font-mono font-black text-amber-400 mt-1 tracking-wider">{createdSecretCoupon.code}</p>
                  <p className="text-xs text-slate-400 mt-1">{createdSecretCoupon.description}</p>
                </div>

                <div className="pt-3 flex flex-col gap-2">
                  <Button
                    onClick={() => handleCopy(createdSecretCoupon.code)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold gap-2"
                  >
                    {copiedCode === createdSecretCoupon.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode === createdSecretCoupon.code ? "Code Copied!" : "Copy Code Only"}</span>
                  </Button>

                  <Button
                    onClick={() =>
                      handleCopy(
                        `Hi! Here is your exclusive 1-time ${
                          createdSecretCoupon.type === "PERCENTAGE" ? `${createdSecretCoupon.value}% OFF` : `₹${createdSecretCoupon.value} OFF`
                        } coupon code for KanchKart: ${createdSecretCoupon.code}`
                      )
                    }
                    variant="outline"
                    className="w-full border-purple-500/40 text-purple-200 hover:bg-purple-900/50 font-bold gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Copy Customer Share Text</span>
                  </Button>
                </div>

                <Button
                  onClick={() => setIsSecretModalOpen(false)}
                  variant="ghost"
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close Window
                </Button>
              </div>
            ) : (
              /* Secret Coupon Form */
              <form onSubmit={handleCreateSecretCoupon} className="space-y-4 text-xs">
                <div>
                  <Label className="text-slate-300 uppercase tracking-wider font-bold">Recipient / Customer Note (Optional)</Label>
                  <Input
                    value={secretCustomerName}
                    onChange={(e) => setSecretCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma (Special Discount)"
                    className="mt-1 bg-slate-950 border-slate-800 text-white focus:border-purple-400"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Helps you track who this secret coupon was generated for.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 uppercase tracking-wider font-bold">Discount Type *</Label>
                    <select
                      value={secretType}
                      onChange={(e) => setSecretType(e.target.value as "PERCENTAGE" | "FIXED")}
                      className="w-full h-10 rounded-md bg-slate-950 border border-slate-800 text-white px-3 text-xs font-semibold focus:border-purple-400"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-300 uppercase tracking-wider font-bold">
                      {secretType === "PERCENTAGE" ? "Discount Rate (%) *" : "Discount Amount (₹) *"}
                    </Label>
                    <Input
                      type="number"
                      value={secretValue}
                      onChange={(e) => setSecretValue(e.target.value)}
                      placeholder="20"
                      required
                      className="bg-slate-950 border-slate-800 text-white font-bold focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 uppercase tracking-wider font-bold">Secret Coupon Code *</Label>
                    <button
                      type="button"
                      onClick={() => setSecretCode(generateRandomCodePrefix("VIP"))}
                      className="text-[11px] text-purple-400 hover:text-purple-300 font-bold underline"
                    >
                      Auto-Generate Code
                    </button>
                  </div>
                  <Input
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value.toUpperCase())}
                    placeholder="VIP-9X4K2P"
                    required
                    className="bg-slate-950 border-slate-800 text-amber-400 uppercase font-mono tracking-widest font-extrabold focus:border-purple-400"
                  />
                  <p className="text-[11px] text-slate-500">Code is restricted to 1 single use and hidden from public website banners.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 uppercase tracking-wider font-bold">Min Order Purchase (₹)</Label>
                  <Input
                    type="number"
                    value={secretMinOrder}
                    onChange={(e) => setSecretMinOrder(e.target.value)}
                    placeholder="0 (No minimum)"
                    className="bg-slate-950 border-slate-800 text-white focus:border-purple-400"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSecretModalOpen(false)}
                    className="border-slate-800 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Generate Secret Coupon"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Standard Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-400" />
                <span>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-950/50 border border-rose-800/80 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 uppercase tracking-wider font-bold">Coupon Code *</Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. KANCH10"
                    required
                    className="bg-slate-950 border-slate-800 text-white uppercase font-mono tracking-widest font-bold focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 uppercase tracking-wider font-bold">Discount Type *</Label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED")}
                    className="w-full h-10 rounded-md bg-slate-950 border border-slate-800 text-white px-3 text-xs font-semibold focus:border-amber-400"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 uppercase tracking-wider font-bold">Description / Offer Tagline</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 10% off on all glassware orders above ₹500"
                  className="bg-slate-950 border-slate-800 text-white focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 uppercase tracking-wider font-bold">
                    {type === "PERCENTAGE" ? "Percentage (%) *" : "Discount (₹) *"}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === "PERCENTAGE" ? "10" : "100"}
                    required
                    className="bg-slate-950 border-slate-800 text-white font-bold focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 uppercase tracking-wider font-bold">Min Order (₹)</Label>
                  <Input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    placeholder="0"
                    className="bg-slate-950 border-slate-800 text-white focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 uppercase tracking-wider font-bold">Max Cap (₹)</Label>
                  <Input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="Unlimited"
                    className="bg-slate-950 border-slate-800 text-white focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded accent-amber-500"
                  />
                  <span>Active &amp; Ready for Customers</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : editingCoupon ? "Save Changes" : "Create Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
