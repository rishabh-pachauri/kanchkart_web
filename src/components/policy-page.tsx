import { db } from "@/lib/db";

export async function PolicyPage({ title, cmsKey }: { title: string; cmsKey: string }) {
  const section = await db.cmsSection.findUnique({ where: { key: cmsKey } });

  return (
    <section className="container max-w-3xl py-12">
      <p className="text-sm font-semibold uppercase text-gold">KanchKart</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">{section?.title || title}</h1>
      <div className="mt-8 rounded-md border bg-white/70 p-6 text-sm leading-7 text-muted-foreground">
        {section?.body ? (
          section.body.split("\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)
        ) : (
          <p>This policy is managed from the KanchKart admin CMS.</p>
        )}
      </div>
    </section>
  );
}

