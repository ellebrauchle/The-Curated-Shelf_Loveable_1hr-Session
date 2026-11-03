import { describe, expect, it } from "vitest";

import imported from "@/lib/imported.json";

type Row = { title: string; recommendedBy?: string };
const rows = imported as Row[];
const byTitle = (t: string) => rows.find((r) => r.title === t)?.recommendedBy;

// Elle's spreadsheet is the source of truth: a named recommender wins, and a blank
// cell means the source is recorded as exactly "cant remember rec" — never a
// placeholder like "Event Ideas list" or "Boston friend".
describe("Recommendation sources", () => {
  it("gives every saved recommendation a source", () => {
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) expect(r.recommendedBy?.trim(), r.title).toBeTruthy();
  });

  it("keeps the named sources from the spreadsheet", () => {
    expect(byTitle("Inside Out 2")).toBe("Mom");
    expect(byTitle("The Creative Brain")).toBe("Jenne");
    expect(byTitle("My Old Ass")).toBe("Zihan");
    expect(byTitle("Mama Ji's")).toBe("Brandon");
    expect(byTitle("Neptune Oyster")).toBe("Spencer");
    expect(byTitle("Toscanini's")).toBe("Spencer");
  });

  it("marks blank spreadsheet rows as exactly cant remember rec", () => {
    expect(byTitle("Paddington")).toBe("cant remember rec");
    expect(byTitle("Simge")).toBe("cant remember rec");
    expect(byTitle("Dragon Eats")).toBe("cant remember rec");
    expect(rows.some((r) => r.recommendedBy === "Event Ideas list")).toBe(false);
    expect(rows.some((r) => r.recommendedBy === "Boston friend")).toBe(false);
  });
});
