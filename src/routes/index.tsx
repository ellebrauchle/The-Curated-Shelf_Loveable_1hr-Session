import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CATEGORIES, type CategoryId } from "@/lib/store";
import { AddItemDialog } from "@/components/AddItemDialog";
import { QuickRecDialog } from "@/components/QuickRecDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Curated Shelf" },
      { name: "description", content: "A personal shelf of recommended books, films, TV shows, music, restaurants and recipes." },
      { property: "og:title", content: "The Curated Shelf" },
      { property: "og:description", content: "A personal shelf of everything friends told me to try." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SUNSET = [
  "oklch(0.42 0.07 115)",
  "oklch(0.66 0.12 100)",
  "oklch(0.76 0.05 85)",
  "oklch(0.52 0.17 30)",
  "oklch(0.38 0.09 35)",
  "oklch(0.7 0.13 95)",
  "oklch(0.6 0.12 70)",
  "oklch(0.55 0.15 45)",
];

function Index() {
  const [open, setOpen] = useState(false);
  const [addCat, setAddCat] = useState<CategoryId | undefined>(undefined);
  const [quick, setQuick] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cols = [CATEGORIES.slice(0, 4), CATEGORIES.slice(4)];
  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <header className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Vol. I — Personal collection</p>
        <h1 className="font-serif text-6xl font-bold leading-none md:text-8xl">The <em className="text-primary">Curated</em> Shelf</h1>
        <p className="mt-4 font-serif text-xl italic text-muted-foreground">Something new to try.....</p>
      </header>

      <div
        className="mx-auto max-w-3xl [perspective:1400px]"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 8, y: ((e.clientY - r.top) / r.height - 0.5) * -6 });
        }}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div
          className="wood relative rounded-t-[999px] rounded-b-[40px] p-3 pt-28 transition-transform duration-300 ease-out md:p-5 md:pt-40"
          style={{ transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`, transformStyle: "preserve-3d" }}
        >
          <div className="pointer-events-none absolute inset-3 rounded-t-[999px] rounded-b-[32px] bg-[radial-gradient(ellipse_at_50%_30%,oklch(0.92_0.12_70/0.55),transparent_65%)] md:inset-5" />
          <div className="relative grid grid-cols-2 gap-3 md:gap-5">
            {cols.map((col, ci) => (
              <div key={ci} className={`flex flex-col ${ci ? "-mt-16 md:-mt-24 border-l-4 border-[var(--wood-deep)]/50 pl-3 md:pl-5" : ""}`}>
                {col.map((c, i) => {
                  const idx = ci * 4 + i;
                  return (
                    <div key={c.id} className="group relative block pt-4">
                      <Link to="/$category" params={{ category: c.id }} className="block">
                        <div className="flex h-24 items-end justify-center gap-[3px] px-2 md:h-28">
                          {Array.from({ length: 20 }).map((_, k) => {
                            const lean = (k * 7 + idx * 3) % 5 === 0;
                            return (
                              <span
                                key={k}
                                className="block origin-bottom rounded-t-[2px] shadow-[0_2px_3px_oklch(0.3_0.1_40/0.45)] transition-transform duration-500 group-hover:-translate-y-1.5"
                                style={{
                                  width: `${7 + ((k * 13 + idx * 5) % 6)}px`,
                                  height: `${56 + ((k * 29 + idx * 11) % 36)}px`,
                                  background: SUNSET[(k + idx) % SUNSET.length],
                                  transform: lean ? "rotate(7deg)" : undefined,
                                  transitionDelay: `${k * 25}ms`,
                                }}
                              />
                            );
                          })}
                        </div>
                        <div className="glass-shelf h-2.5 rounded-sm transition-shadow group-hover:shadow-[0_0_24px_oklch(0.9_0.15_70)]" />
                        <div className="px-1 pt-1.5">
                          <p className="font-serif text-lg italic text-primary-foreground drop-shadow md:text-xl">{c.id === "music" ? "Music" : c.singular} Bin</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => { setAddCat(c.id); setOpen(true); }}
                        aria-label={`Add to ${c.singular} Bin`}
                        className="float absolute right-1 top-[4.4rem] z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[oklch(0.42_0.15_35)] font-serif text-2xl leading-none text-primary-foreground shadow-[0_6px_14px_oklch(0.25_0.08_30/0.55)] transition-transform duration-300 hover:scale-110 hover:rotate-90 md:top-[5.6rem]"
                      >
                        +
                      </button>
                    </div>
                  );
                })}
                {ci === 1 && (
                  <div className="flex justify-center pt-10">
                    <button
                      onClick={() => setQuick(true)}
                      className="sun-glow group flex items-center gap-3 rounded-full px-8 py-4 font-serif text-2xl font-bold italic text-foreground transition-transform duration-300 hover:-translate-y-1 md:text-3xl"
                    >
                      <span className="transition-transform duration-300 group-hover:rotate-90">+</span> New rec
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto h-6 w-[90%] rounded-[50%] bg-[oklch(0.3_0.08_40/0.25)] blur-xl" />
      </div>
      <QuickRecDialog open={quick} onClose={() => setQuick(false)} />
      <AddItemDialog key={addCat ?? "any"} open={open} onClose={() => setOpen(false)} defaultCategory={addCat} />
    </main>
  );
}
