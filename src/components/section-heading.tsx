export function SectionHeading({
  eyebrow,
  title,
  body
}: {
  eyebrow?: string | null;
  title: string;
  body?: string | null;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? <p className="text-sm font-semibold uppercase text-gold">{eyebrow}</p> : null}
      <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight md:text-5xl">{title}</h2>
      {body ? <p className="mt-4 text-base leading-7 text-muted-foreground">{body}</p> : null}
    </div>
  );
}

