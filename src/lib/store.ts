import { useSyncExternalStore } from "react";
import imported from "./imported.json";

export const CATEGORIES = [
  { id: "books", label: "Books", singular: "Book", mapped: false, covered: true },
  { id: "movies", label: "Movies", singular: "Movie", mapped: false, covered: true },
  { id: "shows", label: "TV Shows", singular: "TV Show", mapped: false, covered: true },
  { id: "music", label: "Music", singular: "Album", mapped: false, covered: true },
  { id: "restaurants", label: "Restaurants", singular: "Restaurant", mapped: true, covered: false },
  { id: "recipes", label: "Recipes", singular: "Recipe", mapped: false, covered: false },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);

export type Item = {
  id: string;
  category: CategoryId;
  title: string;
  creator?: string | undefined;
  year?: string | undefined;
  coverUrl?: string | undefined;
  externalRating?: string | undefined;
  recommendedBy?: string | undefined;
  theirThoughts?: string | undefined;
  myRating?: number | undefined;
  completed?: boolean | undefined;
  address?: string | undefined;
  lat?: number | undefined;
  lng?: number | undefined;
  date?: string | undefined;
  link?: string | undefined;
  notes?: string | undefined;
  addedAt: number;
};

const VALID = new Set<string>(CATEGORIES.map((c) => c.id));
const SEED: Item[] = (imported as Item[]).filter((i) => VALID.has(i.category));

const KEY = "archive-items-v2";
let items: Item[] = SEED;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const byId = new Map(SEED.map((s) => [s.id, s]));
      items = (JSON.parse(raw) as Item[]).filter((i) => VALID.has(i.category)).map((i) => {
        const s = byId.get(i.id);
        if (!s) return i;
        return { ...i, coverUrl: i.coverUrl || s.coverUrl, year: i.year || s.year, externalRating: i.externalRating || s.externalRating, recommendedBy: s.recommendedBy };
      });
    }
  } catch {}
}
function save(next: Item[]) {
  items = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useItems() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      load();
      return items;
    },
    () => SEED,
  );
}

export const addItem = (i: Omit<Item, "id" | "addedAt">) =>
  save([...items, { ...i, id: crypto.randomUUID(), addedAt: Date.now() }]);
export const removeItem = (id: string) => save(items.filter((i) => i.id !== id));
export const updateItem = (id: string, patch: Partial<Item>) =>
  save(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
