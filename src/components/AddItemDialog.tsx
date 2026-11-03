import { useState } from "react";
import { addItem, CATEGORIES, getCategory, type CategoryId } from "@/lib/store";

type FieldKey = "title" | "creator" | "year" | "coverUrl" | "externalRating" | "recommendedBy" | "theirThoughts" | "address" | "date" | "notes" | "link";
const field = "w-full border-b border-foreground/40 bg-transparent py-2 font-serif text-lg outline-none focus:border-primary";
const label = "font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground";

export function AddItemDialog({ open, onClose, defaultCategory = undefined }: { open: boolean; onClose: () => void; defaultCategory?: CategoryId | undefined }) {
  const [cat, setCat] = useState<CategoryId>(defaultCategory ?? "books");
  const [f, setF] = useState<Partial<Record<FieldKey, string>>>({});
  const [busy, setBusy] = useState(false);
  if (!open) return null;
  const c = getCategory(cat)!;
  const set = (k: FieldKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.title?.trim()) return;
    setBusy(true);
    let lat: number | undefined, lng: number | undefined;
    if (c.mapped && f.address) {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(f.address)}`);
        const j = await r.json();
        if (j[0]) { lat = +j[0].lat; lng = +j[0].lon; }
      } catch {}
    }
    addItem({ category: cat, title: f.title.trim(), creator: f.creator, year: f.year, coverUrl: f.coverUrl, externalRating: f.externalRating, recommendedBy: f.recommendedBy, theirThoughts: f.theirThoughts, address: f.address, date: f.date, notes: f.notes, link: f.link, lat, lng });
    setBusy(false);
    setF({});
    onClose();
  }

  const creatorLabel = cat === "books" ? "Author" : cat === "music" ? "Artist" : cat === "movies" ? "Director" : cat === "restaurants" ? "Cuisine" : "By";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-foreground/50 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-foreground bg-background p-8 shadow-2xl">
        <p className={label}>New accession</p>
        <h2 className="mb-6 font-serif text-4xl italic">Add to the archive</h2>
        <div className="mb-5 flex flex-wrap gap-2">
          {CATEGORIES.map((x) => (
            <button type="button" key={x.id} onClick={() => setCat(x.id)} className={`border px-3 py-1 font-mono text-xs uppercase tracking-wider ${cat === x.id ? "border-primary bg-primary text-primary-foreground" : "border-foreground/30"}`}>{x.label}</button>
          ))}
        </div>
        <div className="space-y-4">
          <label className="block"><span className={label}>Title *</span><input className={field} value={f.title ?? ""} onChange={set("title")} required /></label>
          <label className="block"><span className={label}>{creatorLabel}</span><input className={field} value={f.creator ?? ""} onChange={set("creator")} /></label>
          {c.covered && <>
            <label className="block"><span className={label}>Year</span><input className={field} value={f.year ?? ""} onChange={set("year")} /></label>
            <label className="block"><span className={label}>Cover image link</span><input className={field} value={f.coverUrl ?? ""} onChange={set("coverUrl")} placeholder="https://…" /></label>
          </>}
          {c.mapped && <label className="block"><span className={label}>Address</span><input className={field} value={f.address ?? ""} onChange={set("address")} /></label>}
          {cat === "recipes" && <label className="block"><span className={label}>Recipe link</span><input className={field} value={f.link ?? ""} onChange={set("link")} /></label>}
          {cat === "recipes" && <label className="block"><span className={label}>Notes</span><textarea className={field} value={f.notes ?? ""} onChange={set("notes")} rows={2} /></label>}
          {cat !== "recipes" && <label className="block"><span className={label}>Public rating</span><input className={field} value={f.externalRating ?? ""} onChange={set("externalRating")} placeholder="e.g. 8.2 IMDb" /></label>}
          <label className="block"><span className={label}>Recommended by</span><input className={field} value={f.recommendedBy ?? ""} onChange={set("recommendedBy")} /></label>
          <label className="block"><span className={label}>Their thoughts</span><textarea className={field} value={f.theirThoughts ?? ""} onChange={set("theirThoughts")} rows={2} /></label>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 font-mono text-xs uppercase tracking-wider">Cancel</button>
          <button disabled={busy} className="bg-primary px-6 py-2 font-mono text-xs uppercase tracking-wider text-primary-foreground">{busy ? "Filing…" : "File it"}</button>
        </div>
      </form>
    </div>
  );
}
