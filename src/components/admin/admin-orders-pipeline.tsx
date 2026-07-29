"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Package, Truck, ShieldCheck, Printer, ArrowRight, Eye, CheckSquare, Square } from "lucide-react";
import { bulkUpdateOrderStatusAction } from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { formatPrice, toNumber } from "@/lib/money";
import { formatDate } from "@/lib/utils";

type SerializedOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  grandTotal: number;
  createdAt: string;
  courierPartner?: string | null;
  trackingNumber?: string | null;
  items: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    image: string;
  }>;
};

type PipelineProps = {
  initialOrders: SerializedOrder[];
};

export function AdminOrdersPipeline({ initialOrders }: PipelineProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<SerializedOrder[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<string>("ORDER_RECEIVED");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { key: "ORDER_RECEIVED", label: "Incoming Orders", badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { key: "CONFIRMED", label: "To Pack", badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    { key: "PACKED", label: "To Dispatch", badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    { key: "DISPATCHED", label: "In Transit", badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
    { key: "DELIVERED", label: "Delivered", badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { key: "CANCELLED", label: "Cancelled", badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30" }
  ];

  // Filter orders matching current activeTab stage
  const filteredOrders = orders.filter((o) => {
    if (activeTab === "ORDER_RECEIVED") return o.status === "ORDER_RECEIVED" || o.status === "PENDING";
    if (activeTab === "CONFIRMED") return o.status === "CONFIRMED" || o.status === "ACCEPTED";
    if (activeTab === "PACKED") return o.status === "PACKED";
    if (activeTab === "DISPATCHED") return o.status === "DISPATCHED" || o.status === "IN_TRANSIT";
    if (activeTab === "DELIVERED") return o.status === "DELIVERED";
    if (activeTab === "CANCELLED") return o.status === "CANCELLED";
    return true;
  });

  function toggleSelectAll() {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  }

  function toggleSelectOrder(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleBulkStatusChange(targetStatus: string) {
    if (selectedIds.length === 0) return;
    setLoading(true);

    try {
      await bulkUpdateOrderStatusAction(selectedIds, targetStatus as any);
      // Update local state instantly so orders move to next pipeline tab
      setOrders((prev) =>
        prev.map((o) => (selectedIds.includes(o.id) ? { ...o, status: targetStatus } : o))
      );
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setLoading(false);
    }
  }

  const bulkLabelUrl = `/admin/orders/labels/bulk?ids=${selectedIds.join(",")}`;

  return (
    <div className="space-y-6">
      {/* Pipeline Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {tabs.map((t) => {
          const count = orders.filter((o) => {
            if (t.key === "ORDER_RECEIVED") return o.status === "ORDER_RECEIVED" || o.status === "PENDING";
            if (t.key === "CONFIRMED") return o.status === "CONFIRMED" || o.status === "ACCEPTED";
            if (t.key === "PACKED") return o.status === "PACKED";
            if (t.key === "DISPATCHED") return o.status === "DISPATCHED" || o.status === "IN_TRANSIT";
            if (t.key === "DELIVERED") return o.status === "DELIVERED";
            if (t.key === "CANCELLED") return o.status === "CANCELLED";
            return false;
          }).length;

          const isActive = activeTab === t.key;

          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setActiveTab(t.key);
                setSelectedIds([]);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                isActive
                  ? "bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-400/10"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bulk Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl"
          >
            {selectedIds.length === filteredOrders.length && filteredOrders.length > 0 ? (
              <CheckSquare className="h-4 w-4 text-amber-400" />
            ) : (
              <Square className="h-4 w-4 text-slate-500" />
            )}
            <span>Select All ({selectedIds.length}/{filteredOrders.length})</span>
          </button>
        </div>

        {selectedIds.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === "ORDER_RECEIVED" ? (
              <Button
                variant="gold"
                size="sm"
                disabled={loading}
                onClick={() => handleBulkStatusChange("CONFIRMED")}
                className="gap-2 font-bold shadow-md"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Accept Selected Orders ({selectedIds.length})</span>
              </Button>
            ) : null}

            {activeTab === "CONFIRMED" ? (
              <Button
                variant="gold"
                size="sm"
                disabled={loading}
                onClick={() => handleBulkStatusChange("PACKED")}
                className="gap-2 font-bold shadow-md"
              >
                <Package className="h-4 w-4" />
                <span>Mark Packed / Ready to Dispatch ({selectedIds.length})</span>
              </Button>
            ) : null}

            {activeTab === "PACKED" ? (
              <Button
                variant="gold"
                size="sm"
                disabled={loading}
                onClick={() => handleBulkStatusChange("DISPATCHED")}
                className="gap-2 font-bold shadow-md"
              >
                <Truck className="h-4 w-4" />
                <span>Mark Dispatched ({selectedIds.length})</span>
              </Button>
            ) : null}

            {activeTab === "DISPATCHED" ? (
              <Button
                variant="gold"
                size="sm"
                disabled={loading}
                onClick={() => handleBulkStatusChange("DELIVERED")}
                className="gap-2 font-bold shadow-md"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Mark Delivered ({selectedIds.length})</span>
              </Button>
            ) : null}

            {/* Bulk Printable QR Labels */}
            <Link
              href={bulkLabelUrl}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-400 hover:text-slate-950 transition"
            >
              <Printer className="h-4 w-4" />
              <span>Generate Bulk Labels & QRs ({selectedIds.length})</span>
            </Link>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Select orders via checkboxes to apply bulk actions & print bulk QR labels.</p>
        )}
      </div>

      {/* Orders List Pipeline Table */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isSelected = selectedIds.includes(order.id);

            return (
              <div
                key={order.id}
                className={`rounded-2xl border transition-all ${
                  isSelected
                    ? "border-amber-400/60 bg-amber-400/5 shadow-lg shadow-amber-400/5"
                    : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
                } p-6 space-y-4`}
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelectOrder(order.id)}
                      className="text-slate-400 hover:text-amber-400 transition"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-amber-400" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-600" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-white text-base hover:text-amber-400 transition"
                        >
                          #{order.orderNumber}
                        </Link>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-400 border border-amber-400/30 uppercase">
                          {order.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Placed on {formatDate(order.createdAt)} • {order.items.length} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-white text-base">{formatPrice(order.grandTotal)}</p>
                      <p className="text-[10px] text-emerald-400 font-semibold uppercase">Prepaid Online ({order.paymentStatus})</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-amber-400 hover:border-amber-400/50 transition"
                        title="View Full Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/orders/${order.id}/label`}
                        target="_blank"
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-amber-400 hover:border-amber-400/50 transition"
                        title="Print Label & QR"
                      >
                        <Printer className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Item Pictures & Customer Info */}
                <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
                  {/* Items Pictures */}
                  <div className="flex flex-wrap items-center gap-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 p-2 rounded-xl">
                        <div className="relative h-12 w-12 rounded-lg border border-slate-800 overflow-hidden shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-[140px]">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                          <p className="text-[10px] text-amber-400 font-semibold">{formatPrice(item.unitPrice)} × {item.quantity} qty</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Details */}
                  <div className="text-xs text-slate-300 space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                    <p className="font-bold text-white text-sm">{order.customerName}</p>
                    <p className="text-slate-400">📞 {order.customerPhone}</p>
                    <p className="text-slate-400 truncate">✉️ {order.customerEmail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-slate-600" />
          <h3 className="mt-3 text-base font-bold text-white">No Orders in this Pipeline Stage</h3>
          <p className="mt-1 text-xs text-slate-400">Orders will automatically populate here as they move through the fulfillment process.</p>
        </div>
      )}
    </div>
  );
}
