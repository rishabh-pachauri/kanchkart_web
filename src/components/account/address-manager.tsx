"use client";

import { useState } from "react";
import { Plus, Trash2, MapPin, Loader2, X, Phone, User, CheckCircle2 } from "lucide-react";
import { addAddressAction, deleteAddressAction } from "@/actions/address-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Address = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string | null;
};

export function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAddAddress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await addAddressAction(formData);

    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setShowModal(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this address?")) return;
    setDeletingId(id);
    await deleteAddressAction(id);
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">Saved Delivery Addresses</h2>
          <p className="text-xs text-slate-500">Manage addresses for fast express checkout</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          variant="gold"
          size="sm"
          className="font-bold gap-1.5 rounded-xl text-slate-950"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </Button>
      </div>

      {/* Address Cards Grid */}
      {initialAddresses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {initialAddresses.map((addr) => (
            <div
              key={addr.id}
              className="relative p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{addr.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {addr.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                  title="Delete address"
                >
                  {deletingId === addr.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                <p className="font-medium text-slate-900">{addr.line1}</p>
                {addr.line2 ? <p>{addr.line2}</p> : null}
                {addr.landmark ? <p className="text-amber-800 font-medium">Landmark: {addr.landmark}</p> : null}
                <p className="font-semibold text-slate-900">
                  {addr.city}, {addr.state} - {addr.postalCode}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="font-bold text-slate-800 text-sm">No Saved Addresses Yet</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">Add your home or office delivery address for instant 1-click checkout.</p>
          <Button onClick={() => setShowModal(true)} variant="gold" size="sm" className="font-bold text-slate-950">
            + Add First Address
          </Button>
        </div>
      )}

      {/* Modal / Dialog for Adding New Address */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif text-xl font-bold text-slate-900">Add New Delivery Address</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddAddress} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-xs font-bold text-slate-700">Full Name *</Label>
                  <Input id="name" name="name" required placeholder="e.g. Rishabh Sharma" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Phone Number *</Label>
                  <Input id="phone" name="phone" required placeholder="e.g. 9876543210" className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="line1" className="text-xs font-bold text-slate-700">Flat / House No. / Building / Street *</Label>
                <Input id="line1" name="line1" required placeholder="House No. 12, Park Street" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="line2" className="text-xs font-bold text-slate-700">Area / Sector / Locality (Optional)</Label>
                <Input id="line2" name="line2" placeholder="Sector 15" className="mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-xs font-bold text-slate-700">City / District *</Label>
                  <Input id="city" name="city" required placeholder="Firozabad" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="state" className="text-xs font-bold text-slate-700">State *</Label>
                  <Input id="state" name="state" required placeholder="Uttar Pradesh" className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode" className="text-xs font-bold text-slate-700">PIN Code *</Label>
                  <Input id="postalCode" name="postalCode" required placeholder="283203" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="landmark" className="text-xs font-bold text-slate-700">Landmark (Optional)</Label>
                  <Input id="landmark" name="landmark" placeholder="Near Temple" className="mt-1" />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={loading} className="font-bold text-slate-950">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    "Save Address"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
