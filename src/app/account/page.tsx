import Link from "next/link";
import { logoutAction } from "@/actions/auth-actions";
import { AddressManager } from "@/components/account/address-manager";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/money";
import { siteMetadata } from "@/lib/seo";
import { requireUser } from "@/lib/security";
import { Package, MapPin, LogOut, ArrowRight, Truck, Mail } from "lucide-react";

export const metadata = siteMetadata({ title: "My Profile & Account" });

export default async function AccountPage() {
  const user = await requireUser();
  const [orders, addresses] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6
    }),
    db.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <section className="container max-w-4xl py-8 px-4 space-y-8">
      {/* Profile Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-400 text-slate-950 font-extrabold text-2xl flex items-center justify-center shadow-lg uppercase">
            {(user.name || user.email || "U")[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">{user.name || "Customer Account"}</h1>
              {user.role === "ADMIN" && (
                <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              {user.email}
            </p>
          </div>
        </div>

        <form action={logoutAction}>
          <Button variant="outline" type="submit" className="border-amber-400/40 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-bold gap-2 rounded-xl">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </form>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Link href="/account/orders" className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 shadow-sm hover:shadow-md transition space-y-2 group">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl w-fit group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">My Orders</p>
          <p className="text-2xl font-bold text-slate-900">{orders.length} Orders</p>
        </Link>

        <a href="#addresses" className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 shadow-sm hover:shadow-md transition space-y-2 group">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl w-fit group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Addresses</p>
          <p className="text-2xl font-bold text-slate-900">{addresses.length} Saved</p>
        </a>

        <Link href="/track-order" className="col-span-2 sm:col-span-1 p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 shadow-sm hover:shadow-md transition space-y-2 group">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl w-fit group-hover:scale-105 transition-transform">
            <Truck className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Track Package</p>
          <p className="text-sm font-bold text-emerald-800 flex items-center gap-1">
            <span>Track Order</span>
            <ArrowRight className="w-4 h-4" />
          </p>
        </Link>
      </div>

      {/* Saved Delivery Addresses Section */}
      <div id="addresses" className="scroll-mt-24">
        <AddressManager initialAddresses={addresses} />
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">Recent Order History</h2>
            <p className="text-xs text-slate-500">Track and review your recent glassware purchases</p>
          </div>
          <Link href="/account/orders" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">#{order.orderNumber}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 uppercase">
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Placed: {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="font-bold text-slate-900 text-base">{formatPrice(order.grandTotal)}</span>
                  <Button asChild variant="outline" size="sm" className="font-bold text-xs rounded-xl">
                    <Link href={`/track-order?orderNumber=${order.orderNumber}`}>Track</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">No Orders Placed Yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Discover our handcrafted premium glassware collection.</p>
            <Button asChild variant="gold" size="sm" className="font-bold text-slate-950">
              <Link href="/shop">Explore Shop</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
