import { CmsForm } from "@/components/admin/cms-form";
import { db } from "@/lib/db";

export default async function AdminCmsPage() {
  const sections = await db.cmsSection.findMany({ orderBy: [{ placement: "asc" }, { sortOrder: "asc" }] });

  return (
    <section className="container py-8">
      <p className="text-sm font-semibold uppercase text-gold">CMS</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Content management</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.85fr]">
        <CmsForm />
        <div className="rounded-md border bg-white/80 p-5">
          <h2 className="font-serif text-3xl font-semibold">Editable sections</h2>
          <div className="mt-4 grid gap-3">
            {sections.map((section) => (
              <div key={section.id} className="rounded-md border bg-ivory p-4">
                <p className="font-medium">{section.title}</p>
                <p className="text-xs text-muted-foreground">
                  {section.key} · {section.placement}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

