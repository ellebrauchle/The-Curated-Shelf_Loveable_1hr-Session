import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { getCategory, removeItem, updateItem, useItems, type CategoryId, type Item } from "@/lib/store";
import { AddItemDialog } from "@/components/AddItemDialog";

const MapView = lazy(() => import("@/components/MapView").then((m) => ({ default: m.MapView })));

export const Route = createFileRoute("/$category")({
  loader: ({ params }) => {
    const c = getCategory(params.category);
    if (!c) throw notFound();
    return { label: c.label };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.label} — The Curated Shelf` : "Unavailable";
    const d = loaderData ? `Recommended ${loaderData.label.toLowerCase()}, who suggested them, and my ratings.` : "Not found";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: CategoryPage,
});

function Cover({ item, big }: { item: Item; big?: boolean }) {
  const [err, setErr] = useState(false);
  if (item.coverUrl && !err)
    return <img src={item.coverUrl} alt={`Cover of ${item.title}`} onError={() => setErr(true)} className="aspect-[2/3] w-full rounded-md object-cover raised" />;
  return (
    <div className="flex aspect-[2/3] w-full flex-col justify-between rounded-md bg-secondary p-4 raised">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{item.year}</span>
      <span className={`font-serif italic leading-tight ${big ? "text-3xl" : "text-xl"}`}>{item.title}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest">{item.creator}</span>
    </div>
  );
}

function Stars({ value, onChange }: { value?: number | undefined; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-0.5" aria-label="My rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} aria-label={`Rate ${n}`} onClick={() => onChange(n)} className={`text-xl leading-none ${value && n <= value ? "text-primary" : "text-foreground/25"} hover:text-primary`}>★</button>
      ))}
    </div>
  );
}

function CategoryPage() {
  const { category } = Route.useParams();
  const c = getCategory(category)!;
  const all = useItems();
  const items = useMemo(() => all.filter((i) => i.category === category), [all, category]);
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const pending = items.filter((i) => !i.completed);
    if (pending.length <= 3) return;
    const t = setInterval(() => setOffset((o) => o + 1), 8000);
    return () => clearInterval(t);
  }, [items]);

  const pending = items.filter((i) => !i.completed);
  const picks = pending.length ? Array.from({ length: Math.min(3, pending.length) }, (_, k) => pending[(offset + k) % pending.length]!) : [];

  const TILTS = ["-rotate-6 translate-y-3", "rotate-1 -translate-y-1", "rotate-6 translate-y-4"];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <Link to="/" className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary">← Back to the shelf</Link>
      <h1 className="mt-2 text-center font-serif text-5xl font-bold italic md:text-6xl">{c.label}</h1>

      {picks.length > 0 && (
        <section className="mt-6">
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Featured — rotating</p>
          <div className="flex items-start justify-center gap-6 md:gap-12">
            {picks.map((p, k) => (
              <article key={p.id + offset} className={`animate-in fade-in zoom-in-95 duration-700 w-28 shrink-0 transition-transform duration-300 hover:z-10 hover:rotate-0 hover:-translate-y-2 hover:scale-110 md:w-40 ${TILTS[k]}`}>
                {c.covered ? (
                  <Cover item={p} />
                ) : (
                  <div className="flex aspect-[3/4] flex-col justify-between rounded-xl bg-card p-3 raised">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-primary">{c.singular}</span>
                    <span className="font-serif text-lg italic leading-tight md:text-xl">{p.title}</span>
                    <span className="line-clamp-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{p.creator ?? p.address ?? p.date ?? p.recommendedBy}</span>
                  </div>
                )}
                {c.covered && (
                  <p className="mt-2 text-center">
                    <span className="block truncate font-serif text-sm">{p.title}</span>
                    <span className="block truncate font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{p.creator}</span>
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 border-t-2 border-dashed border-foreground/40" />

      {c.mapped && (
        <section className="mt-6">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Map of locations</p>
          <Suspense fallback={<div className="h-80 rounded-2xl bg-secondary" />}>
            <div className="wood rounded-2xl p-3"><div className="overflow-hidden rounded-xl"><MapView items={items} /></div></div>
          </Suspense>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-3xl italic">Full Bin <span className="font-mono text-xs not-italic text-muted-foreground">· {items.length}</span></h2>
          <button onClick={() => setOpen(true)} className="rounded-full bg-primary px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary-foreground raised transition-transform hover:-translate-y-0.5">+ Add {c.singular.toLowerCase()}</button>
        </div>
        <div className={c.covered ? "grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6" : "divide-y divide-foreground/20 rounded-2xl bg-card/70 px-5 raised"}>
          {items.map((i) => <Entry key={i.id} item={i} covered={c.covered} />)}
        </div>
        {items.length === 0 && <p className="py-10 text-center font-serif italic text-muted-foreground">This bin is empty.</p>}
      </section>



      <AddItemDialog open={open} onClose={() => setOpen(false)} defaultCategory={category as CategoryId} />
    </main>
  );
}

function Entry({ item: i, covered }: { item: Item; covered: boolean }) {
  return (
    <article className={covered ? "flex flex-col rounded-2xl bg-card/70 p-3 raised" : "grid gap-3 py-5 md:grid-cols-[1fr_1.2fr_auto]"}>
      {covered && <Cover item={i} />}
      <div className={covered ? "mt-3" : ""}>
        <h3 className="font-serif text-xl leading-tight">{i.title}{i.completed && <span className="ml-2 font-mono text-[10px] uppercase text-primary">✓ done</span>}</h3>
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{[i.creator, i.year, i.date].filter(Boolean).join(" · ")}</p>
        {i.address && <p className="text-sm text-muted-foreground">{i.address}</p>}
        {i.externalRating && <p className="mt-1 font-mono text-xs">Rated {i.externalRating}</p>}
        {i.notes && <p className="mt-1 text-sm">{i.notes}</p>}
        {i.link && <a href={i.link} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Open recipe</a>}
      </div>
      <div className={`${covered ? "mt-2" : ""} border-l-2 border-primary pl-3`}>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Recommended by {i.recommendedBy || "—"}</p>
        <p className="font-serif text-sm italic">{i.theirThoughts ? `"${i.theirThoughts}"` : "No notes left."}</p>
      </div>
      <div className={`${covered ? "mt-3" : ""} flex flex-col gap-2`}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Mine</span>
          <Stars value={i.myRating} onChange={(n) => updateItem(i.id, { myRating: n, completed: true })} />
        </div>
        <div className="flex gap-3 font-mono text-[10px] uppercase tracking-wider">
          <button onClick={() => confirm(`Remove "${i.title}"?`) && removeItem(i.id)} className="text-destructive hover:underline">Remove</button>
        </div>
      </div>
    </article>
  );
}
