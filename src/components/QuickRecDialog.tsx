import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { addItem, getCategory } from "@/lib/store";
import { classifyRec } from "@/lib/classify.functions";

export function QuickRecDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [who, setWho] = useState("");
  const [why, setWhy] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const r = await classifyRec({ data: { name: name.trim(), why } });
      addItem({ category: r.category, title: name.trim(), creator: r.creator || undefined, recommendedBy: who.trim() || undefined, theirThoughts: why.trim() || undefined });
      setName(""); setWho(""); setWhy("");
      onClose();
      navigate({ to: "/$category", params: { category: r.category } });
    } catch {
      setErr("Couldn't sort that one — please try again.");
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full rounded-xl border border-foreground/20 bg-background px-4 py-3 font-serif text-lg outline-none focus:border-primary";
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md space-y-4 rounded-3xl bg-card p-7 raised">
        <h2 className="font-serif text-3xl font-bold italic">New rec</h2>
        <label className="block space-y-1"><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">What is it?</span>
          <input autoFocus required value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="e.g. Severance" /></label>
        <label className="block space-y-1"><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Who recommended it?</span>
          <input value={who} onChange={(e) => setWho(e.target.value)} className={field} /></label>
        <label className="block space-y-1"><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Why?</span>
          <textarea rows={3} value={why} onChange={(e) => setWhy(e.target.value)} className={field} /></label>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 font-mono text-xs uppercase">Cancel</button>
          <button disabled={busy} className="rounded-full bg-primary px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-primary-foreground raised disabled:opacity-60">{busy ? "Sorting…" : "Add to my shelf"}</button>
        </div>
      </form>
    </div>
  );
}
export { getCategory };
