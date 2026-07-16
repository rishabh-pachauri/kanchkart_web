import Link from "next/link";
import { BarChart3, Boxes, FileText, LayoutDashboard, Package, ShoppingCart, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/cms", label: "CMS", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 }
];

export function AdminNav() {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b bg-white/75 px-4 py-3">
      {links.map((link) => (
        <Link
          href={link.href}
          key={link.href}
          className="focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-secondary"
        >
          <link.icon className="h-4 w-4 text-gold" />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

