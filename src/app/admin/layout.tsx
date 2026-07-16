import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/security";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-secondary/45">
      <AdminNav />
      {children}
    </div>
  );
}

